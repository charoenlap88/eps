
import { NextResponse } from 'next/server'
import dayjs from 'dayjs';
 
// This function can be marked `async` if using `await` inside
export async function middleware(request, event) {
    const ignore = ['/_next', '/favicon.ico', '/images/', '/api/auth/session', '/api/auth/csrf', '/api','/auth/login','/errorCode']
    const allow = ['/errorCode'];
    const { pathname, search } = request.nextUrl
    // some string in pathname include in ingore
    if (!ignore.some(i => pathname.includes(i))) {
        console.log('middleware',pathname);
        let cookie = request.cookies.get('next-auth.session-token')
        if (cookie?.value) {
            // i want to check if have text errorCode

            const rawResponse = await fetch(process.env.NEXT_PUBLIC_URL+'/api/verifyToken', {
                method: 'POST',
                body: JSON.stringify({token: cookie.value}),
            })
            const content = await rawResponse.json()
            // get user-agent   
            let userAgent = request.headers.get('user-agent')
            await fetch(process.env.NEXT_PUBLIC_URL+'/api/logs/add', {
                method: 'POST',
                body: JSON.stringify({
                    user_id: content.user_id,
                    log_status: `${request.method} ${pathname} ${search}`,
                    date_create: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                    detail: userAgent
                })
            })
        }else{
            // const loginUrl = new URL('/', request.nextUrl.origin); // Construct absolute URL
            // return NextResponse.redirect(loginUrl);
        }
    }else{
        if (allow.some(i => pathname.includes(i))) {
            // let cookie = request.cookies.get('next-auth.session-token')
            const cookie = request.cookies.get('next-auth.session-token')?.value || '';
            if (cookie) {
                const rawResponse = await fetch(process.env.NEXT_PUBLIC_URL+'/api/verifyToken', {
                    method: 'POST',
                    body: JSON.stringify({token: cookie.value}),
                })
                const content = await rawResponse.json();
                let userAgent = request.headers.get('user-agent')
                await fetch(process.env.NEXT_PUBLIC_URL+'/api/logs/add', {
                    method: 'POST',
                    body: JSON.stringify({
                        user_id: content.user_id,
                        log_status: `${request.method} ${pathname} ${search}`,
                        date_create: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                        detail: userAgent
                    })
                })
            }else{
                console.error('Unauthorized access. Please log in.');
                return new NextResponse('Unauthorized access. Please log in.', { status: 401 });
            }
        }
    }
    
    const response = NextResponse.next();
    return response;
}