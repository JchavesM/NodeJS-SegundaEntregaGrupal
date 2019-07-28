const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
require("./helpers");
const body_parser = require("body-parser");
const fncs = require("./functions");
const morgan = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const multer = require("multer");
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const notifier = require('node-notifier');
const sgMail = require('@sendgrid/mail');

/*var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, "photo" + path.extname(file.originalname));
    }
});*/
var upload = multer({});



//connecting to the DB
process.env.URLDB = 'mongodb+srv://jpchavesm:7KzXz5Gky7cFWsU@nodejs-tdea-ursus-nh9zi.mongodb.net/bd-aplicacion?retryWrites=true&w=majority';
mongoose.connect(process.env.URLDB)
    //mongoose.connect('mongodb://localhost/bd-aplicacion')
    .then(db => console.log('Conectado a la BD'))
    .catch(err => console.log(err));

var User = require('../models/user');
var Course = require('../models/course');
var Logged = require('../models/logged');
Logged.remove({}, function(err, removed) {});

// Envío de correos
process.env.SENDGRID_API_KEY = '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';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// const msgPrueba = {
//     to: 'jaeparraro@unal.edu.co',
//     from: 'edkestebanpr23@gmail.com',
//     subject: 'Bienvenido a UrsusGroup',
//     text: 'Ursus Group - TdeA',
//     html: `<p style="text-align: center;"><span style="font-size: 13pt; color: #2d4096;"><strong>Bienvenido a UrsusGroup</strong></span></p>
//     <p style="text-align: left;"><span style="font-size: 13pt; color: #000000; font-family: 'courier new', courier;"><strong>Este grupo est&aacute; compuesto por Esteban, Mario y Juan Pablo. Esperamos sea de su agrado y que la experiencia sea muy agradable.</strong></span></p>
//     <p style="text-align: left;"><span style="font-size: 13pt; color: #000000;"><strong><img style="display: block; margin-left: auto; margin-right: auto;" src="https://ae01.alicdn.com/kf/HTB1K82FNwHqK1RjSZFPq6AwapXaW/Communist-Bear-Flag-Banner-custom-Communist-Bear-with-Historical-Flags-any-logo-Digital-sport-hobby-Flag.jpg_220x220xz.jpg" alt="" /><span style="font-family: symbol;">La mascota del Equipo.</span></strong></span></p>`
// };
// console.log(msgPrueba);
// sgMail.send(msgPrueba).then((res) => {
//     console.log("Correo bienvenida enviado con éxito! a jaeparraro@unal.edu.co");
//     // console.log(res);
// });

//Inicializacion de una BD virgen
const queryUsers = User.estimatedDocumentCount(async(err, count) => {
    if (count == 0) {
        const nuevoCoordinador = new User({
            name: 'Coordinador1',
            id: 0,
            mail: 'coordinador@tdea.com',
            phone: 12345,
            pass: 'coordinador',
            role: 'coordinador',
            courses: [],
            photo: "sdfsf"
        });
        await nuevoCoordinador.save();

        const nuevoDocente = new User({
            name: 'Docente1',
            id: 1,
            mail: 'docente@tdea.com',
            phone: 4567,
            pass: 'docente',
            role: 'docente',
            courses: [],
            photo: "asfdsa"
        });
        await nuevoDocente.save();

        const nuevoEstudiante = new User({
            name: 'Estudiante1',
            id: 2,
            mail: 'esteban@tdea.com',
            phone: 12345,
            pass: 'estudiante',
            role: 'aspirante',
            courses: [],
            photo: "fdfd"
        });
        await nuevoEstudiante.save();

        console.log('No se encontraron usuarios previos.\n' +
            'Se crearon nuevos usuarios:' +
            '	Estudiante -> id: 2 y pass: estudiante' +
            '	Coordinador -> id: 0 y pass: coordinador' +
            '	Docente -> id: 1 y pass: docente');
    } else {
        console.log('Se han encontrado usuarios guardados en la base de datos');
    }
});

//Inicializacion de una BD virgen
const queryCourses = Course.estimatedDocumentCount(async(err, count) => {
    if (count == 0) {
        const nuevoCurso = new Course({
            id: 0,
            name: 'Angular para dummies',
            description: 'Programación desde cero con el framework Angular',
            price: 300,
            modality: 'nocturna',
            hours: 80,
            status: 'no disponible',
            students: []
        });
        await nuevoCurso.save();

        const nuevoCurso2 = new Course({
            id: 1,
            name: 'JS Avanzado',
            description: 'Programación en Javascript usando las mejores prácticas',
            price: 200,
            modality: 'diurna',
            hours: 0,
            status: 'disponible',
            students: []
        });
        await nuevoCurso2.save();

        console.log('No se encontraron cursos previos.');
    } else {
        console.log('Se han encontrado cursos guardados en la base de datos');
    }
});

//settings
app.set('URLDB', process.env.URLDB);
app.set('port', process.env.PORT || 3000); //tomar puerto del sistema o 3000
app.set("view engine", "hbs");
app.use(session({
    secret: "kayboard cat",
    resave: false,
    saveUninitialized: true
}));

//middlewares - funcion ejecutada antes de las rutas
app.use(morgan('dev')); //permite ver respuestas del servidor al cliente
app.use(express.static(path.join(__dirname, "../public")));
hbs.registerPartials(path.join(__dirname, "../partials"));
app.use(body_parser.urlencoded({ extended: false }));

// paths
app.get("/", (req, res) => {
    res.render("index", {
        estudiante: "Mario"
    });
});

app.get("/login", (req, res) => {
    Logged.remove({}, function(err, removed) {});

    // Object
    notifier.notify({
        title: 'My notification',
        message: 'Hello, there!'
    });

    res.render("login");
});

app.post("/login", async(req, res) => {
    const id = req.body.id;
    const user = await User.findOne({ id: id });

    if (user !== null) {
        if (user.pass === req.body.pass) {
            const logged_user = new Logged({
                name: user.name,
                id: user.id,
                mail: user.mail,
                phone: user.phone,
                pass: user.pass,
                role: user.role,
                courses: user.courses,
                photo: user.photo
            });
            await logged_user.save();
            req.session.user = user.id;
            res.redirect("/profile?id=" + req.body.id);
        } else {
            res.render("login", {
                alert: 'Nombre de usuario o contraseña equivocada!'
            });
        }
    } else {
        res.render("register");
    }
});

app.get("/logout", async(req, res) => {
    await Logged.remove({ id: req.session.user });
    req.session.user = null;

    res.redirect("/");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", upload.single("photo"), async(req, res) => {
    try {
        const repetido = await User.findOne({ id: req.body.id });
        console.log(req.body);
        const new_user = new User({
            name: req.body.name,
            id: req.body.id,
            mail: req.body.mail,
            phone: req.body.phone,
            pass: req.body.pass,
            role: req.body.role,
            courses: [],
            photo: req.file.buffer
        });
        if (repetido === null) {
            await new_user.save();
            const msg = {
                to: req.body.mail,
                from: 'edkestebanpr23@gmail.com',
                subject: 'Bienvenido a UrsusGroup',
                text: 'Ursus Group TdeA',
                html: `<p style="text-align: center;"><span style="font-size: 13pt; color: #2d4096;"><strong>Bienvenido a UrsusGroup</strong></span></p>
                <p style="text-align: left;"><span style="font-size: 13pt; color: #000000; font-family: 'courier new', courier;"><strong>Este grupo est&aacute; compuesto por Esteban, Mario y Juan Pablo. Esperamos sea de su agrado y que la experiencia sea muy agradable.</strong></span></p>
                <p style="text-align: left;"><span style="font-size: 13pt; color: #000000;"><strong><img style="display: block; margin-left: auto; margin-right: auto;" src="https://ae01.alicdn.com/kf/HTB1K82FNwHqK1RjSZFPq6AwapXaW/Communist-Bear-Flag-Banner-custom-Communist-Bear-with-Historical-Flags-any-logo-Digital-sport-hobby-Flag.jpg_220x220xz.jpg" alt="" /><span style="font-family: symbol;">La mascota del Equipo.</span></strong></span></p>`
            };
            console.log(msg);
            sgMail.send(msg).then((res) => {
                console.log("Correo enviado con éxito! a " + req.body.mail);
                // console.log(res);
            });
            res.render("register", {
                alert: "Usuario creado con éxito! Se ha enviado un mensaje de bienvenida a tu correo, verifica carpeta de Spam."
            });
        } else {
            res.render("register", {
                alert: "Ya existe un usuario con este ID"
            });

        }
    } catch (err) {
        console.log("Error al registrar:\n" + err);
        res.render("register", {
            alert: "Error registrando nuevo usuario!"
        });
    }
});

app.get("/chat", (req, res) => {
    res.render("chat");
});

app.get("/profile", async(req, res) => {
    const user = await User.findOne({ id: req.query.id });

    if (user === null && user.role != "coordinador") {
        res.redirect("*");
    } else {
        res.render("profile", {
            user: user,
            photo: user.photo.toString("base64"),
            courses: await fncs.get_user_courses(user)
        });
    }
});

app.get("/profile_edit", async(req, res) => {
    if (req.session.user != null) {
        res.render("profile_edit", {
            curr_user: await User.findOne({ id: req.session.user }),
            user: await User.findOne({ id: req.query.id })
        });
    } else {
        res.render("error");
    }
});

app.post("/profile_edit", upload.single("photo"), async(req, res) => {
    var user = await User.findOne({ id: req.query.id });
    console.log(req.query.id);
    var logged = await Logged.findOne({ id: req.session.user });

    if (req.body.name != "" && typeof req.body.name == 'string') {
        user.name = req.body.name;
        if (req.query.id == logged.id) logged.name = req.body.name;
    }
    if (req.body.mail != "" && typeof req.body.mail == 'string') {
        user.mail = req.body.mail;
        if (req.query.id == logged.id) logged.mail = req.body.mail;
    }
    if (req.body.pass != "" && typeof req.body.pass == 'string') {
        user.pass = req.body.pass;
        if (req.query.id == logged.id) logged.pass = req.body.pass;
    }
    if (req.body.phone != "" && typeof req.body.phone == 'number') {
        user.phone = req.body.phone;
        if (req.query.id == logged.id) logged.phone = req.body.phone;
    }
    if (req.body.photo != "") {
        user.photo = req.file.buffer;
        logged.photo = req.file.buffer;
    }
    if ("role" in req.body) {
        user.role = req.body.role;
        if (req.query.id == logged.id) logged.role = req.body.role;
    }

    await user.save();
    await logged.save();

    res.redirect("/profile?id=" + req.session.user);
});

app.get("/courses", async(req, res) => {
    var args = {
        user: await User.findOne({ id: req.session.user }),
        courses: await Course.find({ status: 'disponible' })
    };

    var logged = await Logged.findOne({});
    if (logged != null) {
        if (logged.role !== 'coordinador') {
            args["courses"] = fncs.substract_arrays(await Course.find({ status: 'disponible' }),
                await fncs.get_user_courses(logged));
        } else {
            args["courses"] = fncs.substract_arrays(await Course.find({}),
                await fncs.get_user_courses(logged));
        };
    }

    res.render("courses", args);
});

app.post("/courses", (req, res) => {
    try {
        if (req.body.action == "add") {
            fncs.add_user_to_course(req.session.user, req.body.id);
            fncs.add_course_to_user(req.body.id, req.session.user);

            res.redirect("/profile?id=" + req.session.user);
        } else if (req.body.action == "ch_state") {
            fncs.change_course_state(req.body.id);
            res.redirect("/courses");
        } else {
            if (req.body.action == "del") { // user deleting himself from course
                fncs.del_user_from_course(req.session.user, req.body.id);
                fncs.del_course_from_user(req.body.id, req.session.user);
            }

            res.redirect("/profile?id=" + req.session.user);
        }
    } catch (err) {
        console.log(err);
    }
});

app.get("/students", async(req, res) => {
    if (req.session.user != null) {
        res.render("students", {
            students: await User.find({}),
            curr_user: req.session.user
        });
    } else {
        res.render("error");
    }
});

app.get("/course", async(req, res) => {
    if (req.session.user != null) {
        var course = await Course.findOne({ id: req.query.id });
        var args = {
            course: course,
            students: await fncs.get_course_users(course),
            user: req.session.user != null ? await User.findOne({ id: req.session.user }) : "."
        };

        res.render("course", args);
    } else {
        res.render("error");
    }
});

app.post("/course", async(req, res) => {
    fncs.del_user_from_course(req.body.id, req.body.course_id);
    fncs.del_course_from_user(req.body.course_id, req.body.id);
    res.redirect("/course?id=" + req.body.course_id);
});

app.post("/new_course", (req, res) => {
    var course = new Course(req.body);
    fncs.add_course(course);
    res.redirect("/profile?id=" + req.session.user);
});

app.get("*", (req, res) => {
    res.render("error", {
        estudiante: "error"
    });
});

// sockets
io.on("connection", function(socket) {
    console.log("Un cliente se ha conectado");

    socket.on("room", function(room) {
        socket.room = room;
        socket.join(room);
    });

    socket.on("is_online", function(username) {
        socket.username = username;
        io.sockets.in(socket.room).emit("is_online", socket.username);
    });

    socket.on("is_offline", function(username) {
        socket.leave(socket.room);
        io.sockets.in(socket.room).emit("is_offline", socket.username);
    });

    socket.on("message", function(message) {
        io.sockets.in(socket.room).emit("message", "<strong>" + socket.username + "</strong>: " + message);
    });
});

// starting the server
server.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
});