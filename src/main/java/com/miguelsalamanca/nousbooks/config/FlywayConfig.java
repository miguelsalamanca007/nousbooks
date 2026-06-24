package com.miguelsalamanca.nousbooks.config;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FlywayConfig {

    /**
     * Run {@code repair()} before every {@code migrate()}. Repair clears
     * failed entries from the schema history (e.g. a Postgres-only migration
     * that was attempted against H2 in dev) and realigns checksums when a
     * migration file is moved between vendor folders. Safe to run on every
     * boot — it's a no-op when there's nothing to fix.
     */
    @Bean
    FlywayMigrationStrategy repairAndMigrate() {
        return flyway -> {
            flyway.repair();
            flyway.migrate();
        };
    }
}
