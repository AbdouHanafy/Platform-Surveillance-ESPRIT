package esprit.demo_user_stage.Controller;

import esprit.demo_user_stage.Entity.User;
import esprit.demo_user_stage.Entity.UserDTO;
import esprit.demo_user_stage.Repository.UserRepository;
import esprit.demo_user_stage.Service.auth.CustomUserDetailsService;
import esprit.demo_user_stage.Service.auth.JwtUtils;
import esprit.demo_user_stage.Service.auth.MailService;
import esprit.demo_user_stage.Service.auth.PasswordResetTokenService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private CustomUserDetailsService userService;

    private AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    private final PasswordResetTokenService tokenService;
    private final MailService mailService;

    @Autowired
    public AuthController(PasswordEncoder passwordEncoder, UserRepository userRepository,
                          AuthenticationManager authenticationManager, CustomUserDetailsService userService, PasswordResetTokenService tokenService, MailService mailService) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.tokenService = tokenService;
        this.mailService = mailService;// Injection correcte
    }

   /* @ResponseBody
    @PostMapping("/register")
    public ResponseEntity<UserDTO> registerUser(@RequestBody User user) {
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);

        UserDTO userDTO = new UserDTO();
        userDTO.setId(savedUser.getId());
        userDTO.setMatricule(savedUser.getMatricule());
        userDTO.setUsername(savedUser.getUsername());
        userDTO.setEmail(savedUser.getEmail());
        userDTO.setRole(savedUser.getRole().name());

        return ResponseEntity.ok(userDTO);
    }
*/

    @ResponseBody
    @PostMapping("/register")
    public ResponseEntity<UserDTO> registerUser(@RequestBody User user) {
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        // 1️⃣ Envoyer un email simple avant de hasher le mot de passe
        String subject = "Bienvenue sur notre plateforme";
        String message = "<p>Bonjour " + user.getUsername() + ",</p>" +
                "<p>Merci pour votre inscription !</p>" +
                "<p>Votre matricule : " + user.getMatricule() + "</p>" +
                "<p>Votre mot de passe : " + user.getPassword() + "</p>" +
                "<p>Vous pouvez maintenant vous connecter après validation.</p>";

        try {
            mailService.sendEmail(user.getEmail(), subject, message);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null); // ou un message d'erreur si l'email échoue
        }

        // 2️⃣ Hasher le mot de passe
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // 3️⃣ Stocker l'utilisateur
        User savedUser = userRepository.save(user);

        // 4️⃣ Retourner le DTO
        UserDTO userDTO = new UserDTO();
        userDTO.setId(savedUser.getId());
        userDTO.setMatricule(savedUser.getMatricule());
        userDTO.setUsername(savedUser.getUsername());
        userDTO.setEmail(savedUser.getEmail());
        userDTO.setRole(savedUser.getRole().name());

        return ResponseEntity.ok(userDTO);
    }



    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        // Encoder le mot de passe si présent
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            updatedUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        User user = userService.updateUser(id, updatedUser);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur non trouvé");
        }
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        boolean deleted = userService.deleteUser(id);
        Map<String, String> response = new HashMap<>();

        if (deleted) {
            response.put("message", "Utilisateur supprimé avec succès");
            return ResponseEntity.ok(response);
        } else {
            response.put("message", "Utilisateur non trouvé");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }




   /* @PostMapping("/login")
    public ResponseEntity<UserDTO> authenticate(@RequestBody User user) {
        System.out.println("Tentative de connexion pour l'utilisateur : " + user.getUsername());

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword()));
        } catch (Exception e) {
            System.out.println("Échec de l'authentification : " + e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        String token = JwtUtils.generateToken(user.getUsername());

        // ➕ Injecter dans le contexte Spring Security
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getUsername(),
                token, // credentials
                null
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Récupérer l'ID de l'utilisateur depuis la base de données ou le service utilisateur
        Long userId = userService.getUserIdByUsername(user.getUsername());
        String role = userService.getUserRoleByUsername(user.getUsername());

        UserDTO userDTO = new UserDTO();
        userDTO.setUsername(user.getUsername());
        userDTO.setToken(token);
        userDTO.setId(userId);
        userDTO.setRole(role);


        return ResponseEntity.ok(userDTO);
    }
*/

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(@RequestBody Map<String, String> loginRequest) {
        String matricule = loginRequest.get("matricule");
        String password = loginRequest.get("password");

        System.out.println("Tentative de connexion pour matricule : " + matricule);

        // Récupérer l'utilisateur avant authentification
        User user = userService.getUserByMatricule(matricule);

        if (user == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Utilisateur non trouvé");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        if (!user.isActive()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Compte désactivé, contactez l'administrateur");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(matricule, password));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Matricule ou mot de passe incorrect");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        String token = JwtUtils.generateToken(matricule);

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                matricule,
                token, // credentials
                null
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        Long userId = userService.getUserIdByMatricule(matricule);
        String role = userService.getUserRoleByMatricule(matricule);
        String email = userService.getMailByMatricule(matricule);
        String username = userService.getUsernameByMatricule(matricule);

        UserDTO userDTO = new UserDTO();
        userDTO.setMatricule(matricule);
        userDTO.setToken(token);
        userDTO.setId(userId);
        userDTO.setRole(role);
        userDTO.setEmail(email);
        userDTO.setUsername(username);

        return ResponseEntity.ok(userDTO);
    }


    @GetMapping("/me")
    public ResponseEntity<UserDetails> getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        UserDetails user = userService.loadUserByUsername(username);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/test")
    public String test() {
        return "message from backend successfully";
    }
    // Endpoint pour demander la réinitialisation du mot de passe

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody UserDTO request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Email non trouvé");
        }

        User user = userOpt.get();
        String token = JwtUtils.generateToken(user.getEmail());
        String resetLink = "http://localhost:4200/reset-password?token=" + token;

        String subject = "Réinitialisation de votre mot de passe";
        String message = "<p>Bonjour,</p>" +
                "<p>Vous avez demandé une réinitialisation de votre mot de passe.</p>" +
                "<p>Cliquez sur le lien ci-dessous pour le réinitialiser :</p>" +
                "<p><a href=\"" + resetLink + "\">Réinitialiser mon mot de passe</a></p>" +
                "<p>Si vous n'avez pas fait cette demande, ignorez cet email.</p>";

        try {
            mailService.sendEmail(user.getEmail(), subject, message);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de l'envoi de l'email : " + e.getMessage());
        }

        return ResponseEntity.ok("Email de réinitialisation envoyé !");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestParam String token, @RequestBody User user) {
        String email = JwtUtils.extractUsername(token);
        if (email == null) {
            return ResponseEntity.badRequest().body("Token invalide ou expiré");
        }

        Optional<User> existingUserOpt = userRepository.findByEmail(email);
        if (existingUserOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Utilisateur non trouvé");
        }

        User existingUser = existingUserOpt.get();
        existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(existingUser);

        return ResponseEntity.ok("Mot de passe réinitialisé avec succès !");
    }

    @GetMapping("/{id}")
     public User getUserById(@PathVariable("id") Long id){
        return userService.getUserById(id);
    }

    @GetMapping("/matricule/{matricule}")
    public User getUserByMatricule(@PathVariable String matricule) {
        return userService.getUserByMatricule(matricule);
    }

    @GetMapping("/all")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/enseignants")
    public List<UserDTO> getAllEnseignants() {
        return userService.findAllEnseignants();
    }



    @PatchMapping("/users/{id}/active")
    public ResponseEntity<Map<String, String>> toggleUserActive(@PathVariable Long id, @RequestParam boolean active) {
        try {
            userService.setUserActiveStatus(id, active);
            String status = active ? "activé" : "désactivé";
            Map<String, String> response = new HashMap<>();
            response.put("message", "Utilisateur " + status + " avec succès.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Utilisateur non trouvé.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

}
}