import NextAuth from "next-auth";
import jwt from "jsonwebtoken";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiClient } from "../../../utils/apiClient";
import { hashPassword } from "../../../utils/encryption";
import _ from 'lodash';
import dayjs from 'dayjs';

console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET); // Add this line to verify

export const authOptions = {
	// Configure one or more authentication providers
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				username: {
					label: "Username",
					type: "text",
					placeholder: "Username",
					required: true,
				},
				password: {
					label: "Password",
					type: "password",
					placeholder: "Username",
					required: true,
				},
			},
			async authorize(credentials, req) {
				let old = await apiClient().post('/user/find',{username:credentials.username});
				let salt = old?.data[0]?.salt;
				let result = await apiClient().post('/user/login', {username:credentials.username, password: hashPassword(credentials.password, salt)}).catch(e => console.log('fail', e))
				if (result?.status==200 && _.size(result?.data)>0) {
					await apiClient().put('/user/attempt', {username: credentials.username, attempt: 0})
					// console.log(credentials.username);
					let userInfo = await apiClient().get('/user', {params:{username: credentials.username}})
					// console.log(userInfo.data[0]);

					await fetch(process.env.NEXT_PUBLIC_URL+'/api/logs/add', {
						method: 'POST',
						body: JSON.stringify({
							user_id: _.result(userInfo, 'data[0].id'),
							log_status: `Login`,
							date_create: dayjs().format('YYYY-MM-DD HH:mm:ss'),
							detail: ''
						})
					})
					return {
						user_id: _.result(userInfo, 'data[0].id'),
						username: _.result(userInfo, 'data[0].username'),
						permissions: _.result(userInfo, 'data[0].permissions')
					};
				} else {
					const newAttempt = _.result(old, 'data[0].fail_attempt') + 1
					await fetch(process.env.NEXT_PUBLIC_URL+'/api/logs/add', {
						method: 'POST',
						body: JSON.stringify({
							user_id: 0,
							log_status: `Login Failed`,
							date_create: dayjs().format('YYYY-MM-DD HH:mm:ss'),
							detail: `Fail login username ${credentials.username}, Attempt ${newAttempt}`
						})
					})
					// await apiClient().post('/logs/add', {
					// 	user_id: 0, 
					// 	log_status: 'fail',
					// 	date_create: dayjs().format('YYYY-MM-DD HH:mm:ss'),
					// 	'detail': `Fail login username ${credentials.username}, Attempt ${newAttempt}`
					// })
					await apiClient().put('/user/attempt', {username: credentials.username, attempt: newAttempt})
					return null
				}
			},
		}),
	],
	session: {
		strategy: "jwt",
		maxAge: 30 * 60, // 30 min
		updateAge: 30 * 60, // 30 min
	},
	jwt: {
		maxAge: 30 * 60, // 30 min
		async encode({ token, secret, maxAge }) {
			return jwt.sign(token, secret);
		},
		async decode({ token, secret }) {
			return jwt.verify(token, secret);
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
	callbacks: {
		// async signIn(user, account, profile) {
		// 	console.log(user, account, profile)
		// 	if (user?.username) {
		// 		return true;
		// 	}
		// 	return false;
		// },
		// async authorized({ req, token }) {
		// 	console.log('authorized', token);
		// 	if (token) return true;
		// },
		async jwt({ token, user, account, profile, isNewUser }) {
			if (account?.provider == "credentials" && user?.username) {
				token.user_id = user.user_id;
				token.username = user.username;
				token.user = user.username;
				token.permissions = user?.permissions;
			}
			// console.log('jwt', token, user, account, profile);
			return token;
		},
		async session({ session, user, token }) {
			// console.log('session', token);
			if (token?.username) {
				session.user.user_id = token.user_id;
				session.user.username = token.username;
				session.user.user = token.username;
				session.user.permissions = token.permissions;
				delete session.user.name;
				delete session.user.email;
				delete session.user.image;
			}
			return session;
		},
		async redirect({ url, baseUrl }) {
			// console.log(url, baseUrl)
			return baseUrl
		}
	},
	// ตั้งค่า secure attribute ของ cookie เมื่อใช้ HTTPS.
	cookies: {
		sessionToken: {
		  name: `next-auth.session-token`,
		  options: {
			httpOnly: true,
			sameSite: 'strict',
			path: '/',
			secure: true, // set to true in production when using HTTPS
		  },
		},
	},
	pages: {
		signIn: "/auth/login",
		signOut: "/auth/logout",
		error: "/auth/error",
	},
};

export default NextAuth(authOptions);
