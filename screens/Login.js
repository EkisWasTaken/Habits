import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import InputField from "../components/InputField";
import validator from "validator";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from '../utils/Config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import Colors from '../utils/Colors';

const validateFields = (email, password) => {
  const isValid = {
      email: validator.isEmail(email),
      password: validator.isStrongPassword(password, {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 0,
      }),
  };

  return isValid;
};

const login = (email, password) => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
          console.log("Logged in!");
      });
};

const createAccount = (email, password) => {
    createUserWithEmailAndPassword(auth, email, password)
      .then(({ user }) => {
          console.log("Creating user...", user);
          setDoc(doc(db, 'users', user.uid), {});
      });
};

export default () => {
  const [isCreateMode, setCreateMode] = useState(false);
    const [emailField, setEmailField] = useState({
        text: "",
        errorMessage: "",
    });
    const [passwordField, setPasswordField] = useState({
        text: "",
        errorMessage: "",
    });
    const [passwordReentryField, setPasswordReentryField] = useState({
        text: "",
        errorMessage: "",
    });

  return <View style={styles.container}>
  <Text style={styles.header}>Habits</Text>
  <View style={{ flex: 1, justifyContent: 'center'}}>
      <InputField
          label="Email"
          text={emailField.text}
          onChangeText={(text) => {
              setEmailField({ text });
          }}
          errorMessage={emailField.errorMessage}
          labelStyle={styles.label}
          autoCompleteType="email"
      />
      <InputField
          label="Password"
          text={passwordField.text}
          onChangeText={(text) => {
              setPasswordField({ text });
          }}
          secureTextEntry={true}
          errorMessage={passwordField.errorMessage}
          labelStyle={styles.label}
          autoCompleteType="password"
      />
      {isCreateMode && (
          <InputField
              label="Re-enter Password"
              text={passwordReentryField.text}
              onChangeText={(text) => {
                  setPasswordReentryField({ text });
              }}
              secureTextEntry={true}
              errorMessage={passwordReentryField.errorMessage}
              labelStyle={styles.label}
          />
      )}
      <TouchableOpacity
          onPress={() => {
              setCreateMode(!isCreateMode);
          }}
      >
          <Text
              style={{
                  alignSelf: "center",
                  color: Colors.blue,
                  fontSize: 24,
                  margin: 4,
              }}
          >
              {isCreateMode
                  ? "Already have an account?"
                  : "Create new account"}
          </Text>
      </TouchableOpacity>
  </View>

  <TouchableOpacity
      onPress={() => {
          const isValid = validateFields(
              emailField.text,
              passwordField.text
          );
          let isAllValid = true;
          if (!isValid.email) {
              emailField.errorMessage = "Please enter a valid email";
              setEmailField({ ...emailField });
              isAllValid = false;
          }

          if (!isValid.password) {
              passwordField.errorMessage =
                  "Password must be at least 8 long w/numbers, uppercase, lowercase";
              setPasswordField({ ...passwordField });
              isAllValid = false;
          }

          if (
              isCreateMode &&
              passwordReentryField.text != passwordField.text
          ) {
              passwordReentryField.errorMessage =
                  "Passwords do not match";
              setPasswordReentryField({ ...passwordReentryField });
              isAllValid = false;
          }

          if (isAllValid) {
              isCreateMode
                  ? createAccount(emailField.text, passwordField.text)
                  : login(emailField.text, passwordField.text);
          }
      }}
      style={styles.button}
  >
    <Text style={styles.buttonText}>{isCreateMode ? "Create Account" : "Login"}</Text>
  </TouchableOpacity>
</View>;
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      flexDirection: 'column',
      backgroundColor: Colors.cream,
  },
  label: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: Colors.darkGray 
  },
  header: { 
    fontSize: 72, 
    color: Colors.darkGray,
    alignSelf: "center" 
  },
  button: {
    flexDirection: "row",
    borderRadius: 25,
    backgroundColor: Colors.blue,
    height: 48,
    margin: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white", 
    fontSize: 24, 
    fontWeight: "bold"
  }
});