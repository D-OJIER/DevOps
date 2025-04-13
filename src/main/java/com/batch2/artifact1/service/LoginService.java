package com.batch2.artifact1.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.batch2.artifact1.domain.Login;
import com.batch2.artifact1.repository.LoginRepo;

@Service
public class LoginService {

    @Autowired
    private LoginRepo rep;

    public Login log(String username, String password) {
        Login user = rep.findByUsernameAndPassword(username, password);
        return user;
    }
}
