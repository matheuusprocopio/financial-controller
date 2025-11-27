FROM maven:3.9.9-eclipse-temurin-17 AS builder
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline

COPY . .

RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jdk
WORKDIR /app

COPY --from=builder /app/target/back-end-1.0-SNAPSHOT.jar app.jar

# Copia arquivo de credenciais do Firebase se existir
COPY service-account-key.json* ./

# Força a JVM a priorizar IPv6; requer rede IPv6 habilitada no Docker host
ENV JAVA_TOOL_OPTIONS="-Djava.net.preferIPv6Addresses=true -Djava.net.preferIPv6Stack=true"

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
