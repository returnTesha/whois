package blockchain

import (
	"context"
	"fmt"
	"log/slog"
	"math/big"
	"math/rand"
	"time"

	"github.com/returnTesha/whois/config"
	"github.com/returnTesha/whois/pkg/logger"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

type PolygonProvider struct {
	cfg    config.PolygonConfig
	logger *slog.Logger
	name   string
}

func NewPolygonProvider(cfg config.PolygonConfig, baseLogger *slog.Logger) *PolygonProvider {
	return &PolygonProvider{
		cfg:    cfg,
		logger: logger.WithProvider(baseLogger, "polygon"),
		name:   "polygon",
	}
}

func (p *PolygonProvider) GetName() string {
	return p.name
}

func (p *PolygonProvider) Excute(ctx context.Context, data interface{}, traceID string) (interface{}, error) {
	p.logger.Info("토큰 전송 프로세스 시작", "traceID", traceID)

	// 1. 하드코딩된 설정값들
	rawPrivateKey := ""
	nodeURL := "https://sepolia.infura.io/v3/f2bb01f47de348c7aef4791a7ef32288"
	tokenAddressHex := "0xe211Fd7FD662125038Ce33D993A7e791DF67BB6F" // 토큰 컨트랙트 주소
	toAddressHex := "0x526b0FFA23DbB9980cc0e2E54dB5299Ed05B4861"    // 임시로 설정

	// 2. 노드 연결
	client, err := ethclient.Dial(nodeURL)
	if err != nil {
		return nil, fmt.Errorf("노드 연결 실패: %w", err)
	}

	// 3. 개인키 로드 및 주소 추출
	privateKey, err := crypto.HexToECDSA(rawPrivateKey)
	if err != nil {
		return nil, fmt.Errorf("개인키 로드 실패: %w", err)
	}
	fromAddress := crypto.PubkeyToAddress(privateKey.PublicKey)

	// 4. 랜덤 토큰 수량 결정 (1 ~ 1000)
	rand.Seed(time.Now().UnixNano())
	randomAmount := rand.Intn(1000) + 1

	// 토큰의 Decimals가 18이라고 가정 (일반적)
	// amount = randomAmount * 10^18
	amount := new(big.Int).Mul(big.NewInt(int64(randomAmount)), new(big.Int).Exp(big.NewInt(10), big.NewInt(18), nil))

	// 5. ERC-20 Transfer 데이터 생성
	tokenAddress := common.HexToAddress(tokenAddressHex)
	toAddress := common.HexToAddress(toAddressHex)
	transferFnSignature := []byte("transfer(address,uint256)")
	methodID := crypto.Keccak256(transferFnSignature)[:4]
	paddedAddress := common.LeftPadBytes(toAddress.Bytes(), 32)
	paddedAmount := common.LeftPadBytes(amount.Bytes(), 32)

	var dataBytes []byte
	dataBytes = append(dataBytes, methodID...)
	dataBytes = append(dataBytes, paddedAddress...)
	dataBytes = append(dataBytes, paddedAmount...)

	// 6. 트랜잭션 수수료 및 넌스 설정
	nonce, err := client.PendingNonceAt(ctx, fromAddress)
	if err != nil {
		return nil, err
	}
	gasPrice, err := client.SuggestGasPrice(ctx)
	if err != nil {
		return nil, err
	}

	// 7. 트랜잭션 생성 및 서명
	tx := types.NewTransaction(nonce, tokenAddress, big.NewInt(0), 100000, gasPrice, dataBytes)
	chainID, err := client.NetworkID(ctx)
	if err != nil {
		return nil, err
	}
	signedTx, err := types.SignTx(tx, types.NewEIP155Signer(chainID), privateKey)
	if err != nil {
		return nil, err
	}

	// 8. 전송
	err = client.SendTransaction(ctx, signedTx)
	if err != nil {
		return nil, fmt.Errorf("트랜잭션 전송 실패: %w", err)
	}

	txHash := signedTx.Hash().Hex()
	p.logger.Info("토큰 전송 완료", "txHash", txHash, "amount", randomAmount)

	return txHash, nil
}
