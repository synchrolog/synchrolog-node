function format() {
  return ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" [timestamp\::date[iso]] [synchrolog_anonymous_id\::synchrolog_anonymous_id] [synchrolog_user_id\::synchrolog_user_id]'
}

module.exports = format;