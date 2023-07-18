import { Telegraf, Markup } from "telegraf"
import { config } from "dotenv"
import { init_payment, verify_payment } from "./controllers/payment.js"
import connectDB from "./db/db.js"
import { createUser } from "./controllers/users.js"
import axios from "axios"

config()

const { TELEGRAM_BOT_API, SECRET_KEY } = process.env

const bot = new Telegraf(TELEGRAM_BOT_API)

let credentials = {
    username : undefined,
    email : undefined,
    phone : undefined,
    password : undefined,
    wager : undefined,
    state : undefined
}

const amount = 20000 * 100

let ref = undefined

let state = undefined

bot.use(Telegraf.log())

bot.command("start", ctx => {
    credentials.username = ctx.chat.username

    ctx.replyWithHTML(
        `Hello <b>${ctx.chat.username}</b>\n\n<b>OddZ</b> <i>is an <b>AI</b> platform which uses cutting-edge technology to create bots which automate users betting process. Oddz is solely designed to improve your betting odds via automated betting</i> \n\n<strong>Oddz is avaliable in only SportyBet for now but will soon support other betting platforms</strong>\n\n<i>OddZ is only available in Nigeria</i>`,
        {
            parse_mode : "HTML",
            ...Markup.inlineKeyboard([
                Markup.button.callback("Begin Setup", "setup")
            ])
        }
    )
})

bot.action("setup", ctx => {
    state = "setup"

    ctx.replyWithHTML(
        `<strong>Enter the details of your SportyBet account; This includes your phone number and password.</strong>\n\n<i>Make sure your account details are correct else your Bot will be inactive.</i>\n\n<strong>Please also enter your email address; This is used for payment purposes.</strong>`,
        {
            parse_mode : "HTML",
            ...Markup.inlineKeyboard([
                Markup.button.callback("Enter Account Details", "account")
            ])
        }
    )
})

bot.action("account", ctx => {
    ctx.reply(`Enter your email address`)
})

bot.email(/.com\b/, ctx => {
    if(state == "setup") {
        credentials.email = ctx.message.text

        ctx.reply(`Enter your phone number`)
    } else if(state == "setting") {
        ctx.reply("Congratulations, you just changed your email address")
    }
})

bot.hears(/\b0(7|8|9)\d{9}/, ctx => {
    if(state == "setup") {
        credentials.phone = ctx.message.text

        ctx.replyWithHTML(
            `<b>Enter your Password</b>\n\n<i>When entering your password, please enter the password using the format : <b>"Password:AFSFDHDzxcv1234@#$"</b>. Note, Replace these characters with your actual password and No whitespaces between the characters</i>`
        )
    } else if(state == "setting") {
        ctx.reply("Congratulations, you just changed your phone number")
    }
})

bot.hears(/\bPassword/, ctx => {
    if(state == "setup") {
        credentials.password = ctx.message.text.slice(9)

        ctx.replyWithHTML(
            `<i>Your Bot Setup is almost finished</i>\n\n<b>Enter the minimum amount you would like to allocate for betting. Minimum is 10 Naira</b>\n\n<i>Please make sure your betting account is funded.</i>`
        )
    } else if(state == "setting") {
        ctx.reply("Congratulations, you just changed your password")
    }
})

bot.hears(/[10-1000000000]/, ctx => {
    if(state == "setup") {
        credentials.wager = ctx.message.text

        ctx.replyWithHTML(
            `<i>Your Bot is now ready</i>\n\n<b>To activate the Bot you have to make a payment of 20000 Naira</b>\n\n<i>This payment is a three-month subscription, further payments would be a monthly subscription for 10000 Naira</i>`,
            {
                parse_mode : "HTML",
                ...Markup.inlineKeyboard([
                        Markup.button.callback("Begin Payment", "payment")
                ])
            }
        )   
    } else if(state == "setting") {
        ctx.reply("Congratulations, you just changed your betting allocation")
    }
})

bot.action("payment", async ctx => {
    const params = {
        email : credentials.email,
        amount : amount
    }
    const payment = await init_payment(SECRET_KEY, params)
    const uri = payment.data.authorization_url

    ref = payment.data.reference

    ctx.replyWithHTML(
        `<i>Click the link below, you will be redirected to the payment portal where you will make the payment</i>\n\n<i>Link : ${uri}</i>\n\n<b>Once you have completed payment you will be redirected back to this chat. Enter the command "/paid" to confirm payment</b>`,
        {
            parse_mode : "HTML"
        }
    )
})

bot.command("paid", async ctx => { 
    const payment = await verify_payment(SECRET_KEY, ref)

    if(payment.data.status == "success") {
        credentials.state = "active"

        const user = createUser(credentials)
        console.log(user)

        ctx.replyWithHTML(
            `<i>Congratulations your Bot is now active</i>\n\n<b>May the OddZ always be in your favour</b>\n\n<i>You can always change the settings for your bot, just Enter the command <b>"/settings"</b> to edit bot settings</i>`
        )
    } else {
        ctx.replyWithHTML(
            `<b>Payment not Successful</b>\n\n<i>Kindly repeat the payment procedure to activate your Bot</i>`,
            {
                parse_mode : "HTML",
                ...Markup.inlineKeyboard([
                    Markup.button.callback("Begin Payment", "payment")
                ])
            }
        )
    }
})

bot.command("settings", ctx => {
    state = "setting"

    ctx.replyWithHTML(
        `<b>You can make changes to initals settings like email, phone number, password and betting allocation.</b>\n\n<i>Make sure you made those changes at SportyBet also.</i>\n\n<b>Click or Enter the following commands:</b>\n<i>/email - For Editing Email Address</i>\n<i>/phone- For Editing Phone Number</i>\n<i>/password - For Editing Password</i>\n<i>/bet - For Editing Betting Allocation</i>`,
        {
            parse_mode : "HTML"
        }
    )
})

bot.command("email", ctx => {
    ctx.reply("Enter your new Email Address")
})

bot.command("phone", ctx => {
    ctx.reply("Enter your new Phone Number")
})

bot.command("password", ctx => {
    ctx.replyWithHTML(
        `<b>Enter your new Password</b>\n\n<i>When entering your password, please enter the password using the format : <b>"Password:AFSFDHDzxcv1234@#$"</b>. Note, Replace these characters with your actual password and No whitespaces between the characters</i>`
    )
})

bot.command("bet", ctx => {
    ctx.reply("Enter your new Betting Allocation, Note : Minimum is 10 Naira and make sure your account is funded.")
})

bot.mention("@OdddZ_bot", async ctx => {
    const code = ctx.channelPost.text.slice(9, 17)

    console.log(code)

    await axios.get(`http://127.0.0.1:5000/bets/${code}`)

    ctx.sendMessage("Success", ctx.chat.id)
})

connectDB()

bot.launch()