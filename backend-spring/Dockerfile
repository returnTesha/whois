# --- 1단계: 빌드 스테이지 (Spring 소스를 WAR로 빌드) ---
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# 빌드에 필요한 파일 복사
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
COPY src src

# 실행 권한 부여 및 WAR 빌드 (테스트는 제외해서 에러 방지)
RUN chmod +x ./gradlew
RUN ./gradlew clean war -x test

# --- 2단계: 실행 스테이지 (빌드된 WAR를 Tomcat에 넣기) ---
FROM tomcat:10-jdk21-temurin
WORKDIR /usr/local/tomcat/webapps/

ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 톰캣 포트를 8080 -> 5000으로 변경
RUN sed -i 's/port="8080"/port="5000"/' /usr/local/tomcat/conf/server.xml

# 기존 기본 앱 삭제
RUN rm -rf ROOT examples docs

# 위(builder)에서 만든 WAR 파일을 Tomcat 경로에 맞게 복사
# 파일명을 api#spring#v1.war로 해서 Context Path /api/spring/v1 자동 적용
COPY --from=builder /app/build/libs/*.war ./api#spring#v1.war

EXPOSE 5000
CMD ["catalina.sh", "run"]
