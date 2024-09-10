create database SistemCitas;
use SistemCitas;

CREATE TABLE productos (
    idProd INT AUTO_INCREMENT PRIMARY KEY,
    nombreProd VARCHAR(100) NOT NULL,
    descripcionProd TEXT,
    precioProd DECIMAL(10, 2) NOT NULL,
    inventarioProd INT NOT NULL,
    fechaRegistroProd TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fechaActualizacionProd TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE servicios (
    idServ INT AUTO_INCREMENT PRIMARY KEY,
    nombreServ VARCHAR(100) NOT NULL,
    descripcionServ TEXT,
    duracionServ INT NOT NULL,  -- Duración en minutos
    precioServ DECIMAL(10, 2) NOT NULL,
    fechaRegistroServ TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE citas (
    idCita INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT NOT NULL,  -- Usuario que solicita la cita (cliente)
    idServicio INT NOT NULL,
    fechaCita DATETIME NOT NULL,
    estadoCita ENUM('pendiente', 'confirmada', 'cancelada') NOT NULL DEFAULT 'pendiente',
    fechaRegistroCita TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idServicio) REFERENCES servicios(idServ)
);




select * from Servicios