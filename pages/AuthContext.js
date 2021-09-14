import { createContext, useState } from "react";

export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const localUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("currentUser"))
      : null;
  //   const localUser = JSON.parse(localStorage.getItem("user"));
  const [currentUser, setCurrentUser] = useState(localUser);

  const isAuthenticated = () => {
    if (!currentUser) return false;
    return new Date().getTime() / 1000 < currentUser.token_expiration;
  };

  // const getNewToken = async()=>{
  //   try{
  //     const {data} = await
  //   }
  // }

  const signup = async (name, email, password) => {
    // const input = { name, email, password };
    // console.log(input);
    const res = await fetch(`http://localhost:3000/api/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
       mutation Mutation($signUpInput: UserInput!) {
        signUp(input: $signUpInput) {
          user {
            email
            name
            id
          }
          token_expiration
        }
      }
       `,
        variables: `
       {
        "signUpInput": {
            "name": "${name}",
            "email": "${email}",
            "password":"${password}"
          }
       }
       `,
      }),
    });

    const data = await res.json();
    if (data.errors) {
      data.errors.map((error) => {
        throw new Error(`ERROR: ` + error.message);
      });
    }
    const { signUp } = data.data;
    localStorage.setItem("currentUser", JSON.stringify(signUp));
    setCurrentUser(signUp);
  };
  const login = async (email, password) => {
    const res = await fetch(`http://localhost:3000/api/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
        query Query {
          login(email: "${email}" , password: "${password.toString()}") {
            
                  id
                name
                email
                role
          }
        }
      `,
      }),
    });

    const data = await res.json();
    console.log(data);
    const { login } = data.data;
    localStorage.setItem("currentUser", JSON.stringify(login));
    setCurrentUser(login);
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser({});
  };

  const value = {
    isAuthenticated,
    login,
    logout,
    signup,
    currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
