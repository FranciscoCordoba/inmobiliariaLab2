import express from "express";
import cors from "cors";
import "dotenv/config";
import propietariosRouter from "./routes/propietarios.js";
import inquilinosRouter from "./routes/inquilinos.js";
import tiposInmuebleRouter from "./routes/tipos_inmueble.js";
import inmueblesRouter from "./routes/inmuebles.js";
import reservasRouter from "./routes/reservas.js";

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.get('/', (req, res) => {
    res.json({ message: "API Inmobiliaria OK" });
});

app.use('/propietarios', propietariosRouter);
app.use('/inquilinos', inquilinosRouter);
app.use('/tipos-inmueble', tiposInmuebleRouter);
app.use('/inmuebles', inmueblesRouter);
app.use('/reservas', reservasRouter);


if (!process.env.NODE_ENV) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
}

export default app;