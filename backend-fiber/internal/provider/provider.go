package provider

import "context"

type Provider interface {
	GetName() string
	Excute(ctx context.Context, data interface{}, traceID string) (interface{}, error)
}

type Registry struct {
	providers map[string]Provider
}

func NewRegistry() *Registry {
	return &Registry{
		providers: make(map[string]Provider),
	}
}

func (r *Registry) Register(provider Provider) {
	r.providers[provider.GetName()] = provider
}

func (r *Registry) GetProvider(name string) Provider {
	return r.providers[name]
}

func (r *Registry) GetProviders() map[string]Provider {
	return r.providers
}
