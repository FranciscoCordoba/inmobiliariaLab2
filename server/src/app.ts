import express from "express";
import propietariosRouter from "./routes/propietarios.js";
import inquilinosRouter from "./routes/inquilinos.js";
import cors from "cors";

const PORT = process.env.PORT || 5000

const app = express();

app.use(express.json())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.get('/', (req, res) => {
    res.json({ message: "Hola" })
})

app.use('/propietarios', propietariosRouter)
app.use('/inquilinos', inquilinosRouter)

if (!process.env.NODE_ENV) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
}

export default app;