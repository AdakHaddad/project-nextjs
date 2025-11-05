import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { ZodError } from "zod";
import prisma from "./prisma"
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcrypt";
import { signInSchema } from "./zod" 

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   session: {
//     strategy: "jwt",
//   },
//   pages: {
//     signIn: '/page.tsx'
//   },
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     Credentials({
//       credentials: {
//         username: { label: "Username", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       authorize: async (credentials) => {
//         try {
//           console.log("Attempting to authorize user");
//           const { username, password } = await signInSchema.parseAsync(credentials);
//           console.log("Credentials parsed successfully");
          
//           const existingUser = await prisma.user.findUnique({
//             where: { username },
//           });
//           console.log("User lookup complete", existingUser ? "User found" : "User not found");
      
//           if (!existingUser || !existingUser.password) {
//             console.log("User not found or password not set");
//             return null;
//           }
      
//           console.log("Comparing passwords");
//           const passwordCorrect = await bcrypt.compare(
//             password,
//             existingUser.password
//           );
//           console.log("Password comparison result:", passwordCorrect);
      
//           if (!passwordCorrect) {
//             console.log("Incorrect password");
//             return null;
//           }
      
//           console.log("Authorization successful");
//           return { id: existingUser.id, username: existingUser.username };
//         } catch (error) {
//           if (error instanceof ZodError) {
//             // Return `null` to indicate that the credentials are invalid
//             return null;
//           }
//           // Re-throw the error to handle it globally if necessary
//           throw error;
//         }
//       },
//     }),
//   ],
// });


export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",  // Using JWT strategy for session
    maxAge: 30 * 60,  // Set session max age to 30 minutes (in seconds)
  },
  pages: {
    signIn: '/',  // Custom sign-in page
  },
  // Remove PrismaAdapter when using JWT strategy with Credentials provider
  // adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          console.log("Attempting to authorize user");

          // Parse and validate credentials
          const { username, password } = await signInSchema.parseAsync(credentials);
          console.log("Credentials parsed successfully");

          // Find the user by username
          const existingUser = await prisma.user.findUnique({
            where: { username },
          });
          console.log("User lookup complete", existingUser ? "User found" : "User not found");

          // If user doesn't exist or doesn't have a password, return null
          if (!existingUser || !existingUser.password) {
            console.log("User not found or password not set");
            return null;
          }

          // Compare the password with the stored hash
          console.log("Comparing passwords");
          const passwordCorrect = await bcrypt.compare(password, existingUser.password);
          console.log("Password comparison result:", passwordCorrect);

          if (!passwordCorrect) {
            console.log("Incorrect password");
            return null;
          }

          console.log("Authorization successful");

          // Return user object (with more details like email)
          return {
            id: existingUser.id,
            username: existingUser.username,
          };
        } catch (error) {
          // If the error is related to Zod validation, return null
          if (error instanceof ZodError) {
            console.error("Zod validation error:", error.errors);
            return null;
          }
          
          // If there's any other error, re-throw it
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add user info to JWT token on sign in
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user info from JWT to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
});

// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { ZodError } from "zod";
// import prisma from "./prisma";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import bcrypt from "bcrypt";
// import { signInSchema } from "./zod";

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   session: {
//     strategy: "jwt",
//   },
//   pages: {
//     signIn: '/login', // Change this to the actual path of your login page
//   },
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     CredentialsProvider({
//       name: 'Credentials',
//       credentials: {
//         username: { label: "Username", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         try {
//           const { username, password } = await signInSchema.parseAsync(credentials);
          
//           // Check if the user exists
//           const existingUser = await prisma.user.findUnique({
//             where: { username },
//           });
//           console.log("User lookup complete", existingUser ? "User found" : "User not found");

//           // If no user is found or no hashed password
//           if (!existingUser || !existingUser.password) {
//             return null;
//           }

//           // Compare the provided password with the stored hashed password
//           const passwordCorrect = await bcrypt.compare(
//             password,
//             existingUser.password
//           );

//           if (!passwordCorrect) {
//             return null;
//           }

//           return { id: existingUser.id, username: existingUser.username };
//         } catch (error) {
//           if (error instanceof ZodError) {
//             // Return `null` to indicate that the credentials are invalid
//             return null;
//           }
//           // Re-throw the error to handle it globally if necessary
//           throw error;
//         }
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.username = user.username;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user.id = token.id;
//         session.user.username = token.username;
//       }
//       return session;
//     },
//   },
// });