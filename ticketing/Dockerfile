# ---- Étape de build (Maven) ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
# Build sans les tests
RUN mvn -q -B -DskipTests package

# ---- Étape d'exécution (JRE) ----
FROM eclipse-temurin:17-jre
WORKDIR /app

# Render fournit la variable PORT ; on la passe à Spring Boot
ENV PORT=8080
ENV JAVA_OPTS=""

# Copie du jar construit à l'étape précédente
COPY --from=build /app/target/*.jar app.jar

# Port exposé (optionnel, utile en local)
EXPOSE 8080

# Démarrage : on force Spring Boot à écouter sur ${PORT}
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -Dserver.port=${PORT} -jar app.jar"]
