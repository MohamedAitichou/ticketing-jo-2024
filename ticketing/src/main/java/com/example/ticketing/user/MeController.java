package com.example.ticketing.user;

import com.example.ticketing.auth.dto.MeResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.reflect.Method;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api")
public class MeController {

    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(@AuthenticationPrincipal(expression = "user") User user) {

        List<?> rawRoles = user.getRoles() == null ? Collections.emptyList() : user.getRoles();

        List<String> roles = rawRoles.stream()
                .map(r -> {
                    if (r == null) return "";

                    if (r instanceof String s) return s;

                    try {
                        Method m = r.getClass().getMethod("getRole");
                        Object v = m.invoke(r);
                        if (v != null) return String.valueOf(v);
                    } catch (Exception ignored) {}

                    try {
                        Method m = r.getClass().getMethod("getAuthority");
                        Object v = m.invoke(r);
                        if (v != null) return String.valueOf(v);
                    } catch (Exception ignored) {}

                    return String.valueOf(r);
                })
                .filter(s -> s != null && !s.isBlank())
                .toList();

        MeResponse body = new MeResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                roles
        );
        return ResponseEntity.ok(body);
    }
}
