import { useEffect, useState } from "react"

export function Propietarios() {
    const [propietarios, setPropietarios] = useState([])

    useEffect(() => {
        async function fetchPropietarios() {
            const response = await fetch('http://localhost:5000/propietarios')
            const data = await response.json()
            setPropietarios(data)
        }
        fetchPropietarios()
    }, [])

    return (
        <>
            <h1>Propietarios</h1>
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>DNI</th>
                        <th>Teléfono</th>
                        <th>Correo</th>
                    </tr>
                </thead>
                <tbody>
                    {propietarios.map((propietario) => (
                        <tr key={propietario.id}>
                            <td>{propietario.nombre}</td>
                            <td>{propietario.apellido}</td>
                            <td>{propietario.dni}</td>
                            <td>{propietario.telefono}</td>
                            <td>{propietario.email}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}