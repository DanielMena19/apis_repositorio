
use sql3731923;

CREATE TABLE productos (
  idProd INT AUTO_INCREMENT PRIMARY KEY,
  nombreProd VARCHAR(100) NOT NULL,
  descripcionProd TEXT,
  precioProd DECIMAL(10, 2) NOT NULL,
  inventarioProd INT NOT NULL,
  fechaProd TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
    nombrecliente varchar(50),  -- Usuario que solicita la cita (cliente)
    idEmpleado int not null,
    idServicio INT NOT NULL,
    fechaCita DATETIME NOT NULL,
    estadoCita ENUM('pendiente', 'confirmada', 'cancelada') NOT NULL DEFAULT 'pendiente',
    fechaRegistroCita TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (idServicio) REFERENCES servicios(idServ)
);





select * from productos;
select * from citas;
select * from servicios