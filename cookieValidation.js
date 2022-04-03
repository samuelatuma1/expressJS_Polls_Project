const CSRF_Token = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNPQRSTUVWXYZ-?._$£%&*^'
    let data_length = 40 + Math.floor(Math.random() * 40)
    let token = ''
    for(let tk_len = 0; tk_len < data_length; tk_len++){
        let rand_idx = Math.floor(Math.random() * chars.length)
        token += chars[rand_idx]
    }

    return token
}

module.exports = {CSRF_Token}