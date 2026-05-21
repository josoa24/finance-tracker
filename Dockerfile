# Étape 1 : Build de l'application avec Maven et Java 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copier le fichier de configuration Maven et les sources
COPY pom.xml .
COPY src ./src

# Compiler le projet et générer le fichier .jar (en ignorant les tests)
RUN mvn clean package -DskipTests

# Étape 2 : Exécution de l'application avec une image Java 21 légère
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copier le fichier .jar généré à l'étape précédente
COPY --from=build /app/target/*.jar app.jar

# Exposer le port par défaut de Spring Boot
EXPOSE 8080

# Commande pour lancer l'application
ENTRYPOINT ["java", "-jar", "app.jar"]