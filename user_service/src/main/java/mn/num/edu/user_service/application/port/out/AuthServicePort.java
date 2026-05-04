package mn.num.edu.user_service.application.port.out;

import reactor.core.publisher.Mono;

public interface AuthServicePort {
    Mono<Void> registerCredentials(String sisiId, String password, String role);
}
