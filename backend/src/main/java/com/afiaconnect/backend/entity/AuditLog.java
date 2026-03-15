package com.afiaconnect.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID logId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String action;
    private String entityName;
    private UUID entityId;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> oldValue;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> newValue;

    private String ipAddress;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}