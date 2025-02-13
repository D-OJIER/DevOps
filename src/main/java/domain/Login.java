package domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name='login')

public class Login {
public void setUsername(String username) {
        this.username = username;
    }
    public void setPassword(String password) {
        this.password = password;
    }
@Id
private String username;
public Login() {
}
public String getUsername() {
    return username;
}
public String getPassword() {
    return password;
}
private String password;
public Login(String username, String password) {
    this.username = username;
    this.password = password;
}

}
