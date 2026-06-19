# ===== Etapa 1: Build =====
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copiamos primero el wrapper y el pom.xml para aprovechar la cache de Docker
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Descarga de dependencias (se cachea si el pom.xml no cambia)
RUN ./mvnw dependency:go-offline -B

# Ahora copiamos el resto del código fuente
COPY src ./src

# Compilamos el jar, sin correr los tests (ya deberían correr en CI)
RUN ./mvnw clean package -DskipTests -B

# ===== Etapa 2: Runtime =====
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Creamos un usuario no-root
RUN addgroup -S spring && adduser -S spring -G spring

# Copiamos solo el jar generado en la etapa anterior
COPY --from=build /app/target/*.jar app.jar

# Cambiamos al usuario no-root
USER spring:spring

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]