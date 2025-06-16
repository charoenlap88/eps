module.exports = {
    apps : [{
        name: 'epson_web',
        script: 'node_modules/next/dist/bin/next',
        args: 'start',
        autorestart: true,
        max_memory_restart: '4G',
    }],
    deploy : {
        production : {
            user : 'charoenlap',
            host : ['18.142.48.217'],
            ref  : 'origin/master',
            repo : 'https://charoenlap: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@github.com/charoenlap/epson.git',
            path : '/home/charoenlap/epson',
            'pre-deploy' : 'git fetch --all && git reset --hard && git clean  -d  -f .',
            'post-deploy' : 'npm run build && pm2 startOrRestart ecosystem.config.js --env production && pm2 save'
        },
        dev : {
            user : 'mg',
            host: "localhost",
            ref  : 'origin/master',
            repo : 'git@github.com:charoenlap/epson.git',
            path : 'D:\\fsoftpro\\test',
            'pre-deploy' : 'git fetch --all && git reset --hard && git clean  -d  -f .',
            'post-deploy' : 'pm2 startOrRestart ecosystem.config.js --env dev && pm2 save'
        },
    }
};

