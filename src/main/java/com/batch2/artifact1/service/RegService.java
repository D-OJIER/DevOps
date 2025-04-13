package com.batch2.artifact1.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.batch2.artifact1.domain.Login;
import com.batch2.artifact1.repository.RegRepo;

@Service
public class RegService {
    @Autowired
    private RegRepo rep;

    public boolean registerUser(String username, String password) {

        if (rep.findByUsername(username) != null) {
            return false;
        }

        Login newUser = new Login(username, password);
        rep.save(newUser);
        return true;
    }

}
