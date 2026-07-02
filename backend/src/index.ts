import  express, { Application,Request, Response  } from "express"
import dotenv from "dotenv"
import cors from "cors"
import { runDatabase } from "./database/mongodb"
import { PORT } from "./config"
import { runRedis } from "./database/redis"
import AuthRouter from "./features/user/routes/auth.routes"
import UserRouter from "./features/user/routes/user.routes"
import OrganizationRouter from "./features/organization/routes/organization.routes"
import FormsRouter from "./features/forms/routes/forms.routes"
import SubmissionsRouter from "./features/submissions/routes/submissions.routes"
import ShareRouter from "./features/share/routes/share.routes"
import NotificationsRouter from "./features/notifications/routes/notifications.routes"
import BillingRouter from "./features/billing/routes/billing.routes"
import { errorHandler } from "./middleware/errorHandler"
import { cookieParser } from "./middleware/cookieParser"
import { UPLOAD_DIR } from "./middleware/upload"

const app:Application = express()
const corsOptions = {
    origin: ["http://192.168.1.68:3000", "http://localhost:3000", "http://localhost:3001"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions))
app.use('/uploads', express.static(UPLOAD_DIR))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser)

app.use("/api/auth", AuthRouter)
app.use("/api/users", UserRouter)
app.use("/api/organizations", OrganizationRouter)
app.use("/api/forms", FormsRouter)
app.use("/api/submissions", SubmissionsRouter)
app.use("/api/share", ShareRouter)
app.use("/api/notifications", NotificationsRouter)
app.use("/api/billing", BillingRouter)

app.get("/", (_:Request, res:Response) => {
    res.send("Hello World")
})

app.use(errorHandler)

async function startServer() {
    await runDatabase()
    await runRedis()
    app.listen(PORT, () => {
        console.log(`Server is running on http://127.0.0.1:${PORT}`)
    })
}

startServer();
