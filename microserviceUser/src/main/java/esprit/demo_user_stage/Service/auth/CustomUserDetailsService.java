package esprit.demo_user_stage.Service.auth;

import esprit.demo_user_stage.Entity.User;
import esprit.demo_user_stage.Entity.UserDTO;
import esprit.demo_user_stage.Repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

   /* @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found");
        }
        String roleName = "ROLE_" + user.getRole().name();  // si enum
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();
    }*/

    public User updateUser(Long id, User updatedUser) {
        return userRepository.findById(id).map(user -> {
            user.setUsername(updatedUser.getUsername());
            user.setMatricule(updatedUser.getMatricule());
            user.setEmail(updatedUser.getEmail());
            user.setRole(updatedUser.getRole());
            if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                user.setPassword(updatedUser.getPassword()); // ⚠️ N'oublie pas d'encoder dans le controller
            }
            return userRepository.save(user);
        }).orElse(null);
    }
    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }




    @Override
    public UserDetails loadUserByUsername(String matricule) throws UsernameNotFoundException {
        User user = userRepository.findByMatricule(matricule);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with matricule: " + matricule);
        }
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getMatricule())  // utiliser matricule ici
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();
    }

    public Long getUserIdByUsername(String username) {
        User user = userRepository.findByUsername(username);  // Récupérer l'utilisateur depuis la base de données
        if (user != null) {
            return user.getId();  // Retourner l'ID de l'utilisateur
        }
        return null;
    }
    public String getUserRoleByUsername(String username) {
        User user = userRepository.findByUsername(username);  // Récupérer l'utilisateur depuis la base de données
        if (user != null) {
            return user.getRole().name();  // Retourner l'ID de l'utilisateur
        }
        return null;
    }



    //get users by id
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }



    //get users by matricule
    public User getUserByMatricule(String matricule) {
    return userRepository.findByMatricule(matricule);
    }


    public List<User> getAllUsers() {
        return userRepository.findAll();
    }



    public Long getUserIdByMatricule(String matricule) {
        User user = userRepository.findByMatricule(matricule);
        if (user != null) {
            return user.getId();
        }
        return null;
    }

    public String getUserRoleByMatricule(String matricule) {
        User user = userRepository.findByMatricule(matricule);
        if (user != null) {
            return user.getRole().name();
        }
        return null;
    }

    //get mail by matricule
    public String getMailByMatricule(String matricule) {
        User user = userRepository.findByMatricule(matricule);
        if (user != null) {
            return user.getEmail();
        }
        return null;
    }
    //get username by matricule
    public String getUsernameByMatricule(String matricule) {
        User user = userRepository.findByMatricule(matricule);
        if (user != null) {
            return user.getUsername();
        }
        return null;
    }

    public List<UserDTO> findAllEnseignants() {
        return userRepository.findByRole("enseignant")
                .stream()
                .map(user -> {
                    UserDTO dto = new UserDTO();
                    dto.setId(user.getId());
                    dto.setMatricule(user.getMatricule());
                    dto.setUsername(user.getUsername()); // ou nom complet si tu as
                    dto.setRole(user.getRole().name());
                    dto.setEmail(user.getEmail());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public void setUserActiveStatus(Long userId, boolean active) {
        Optional<User> userOpt = userRepository.findById(userId);
        if(userOpt.isPresent()) {
            User user = userOpt.get();
            user.setActive(active);
            userRepository.save(user);
        } else {
            throw new RuntimeException("Utilisateur non trouvé");
        }
    }


    //UPDATE + DELETE

}
