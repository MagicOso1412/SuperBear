const pool = require("../../database");
const { env } = require("../../credenciales");

module.exports = {
    async crearLista(req, res) {
        try {
            const {nombre}  = req.body;
            const {grupo} = req.body;
            let nom = [nombre];
            await pool.query(
                "INSERT INTO mlista (nom_lis, fec_lis, id_esList, tot_list) VALUES (?,CURDATE(),1,0.0)",
                [nom]
            );
            const id_list = await pool.query(
                "select id_lis from mlista where id_lis = (select MAX(id_lis) from mlista)"
            );
            let union = [grupo, id_list[0].id_lis];
            await pool.query(
                "INSERT INTO ELista (id_grp, id_lst) VALUES (?)",
                [union]
            );
            const nomGrp = await pool.query(
                "SELECT nom_grp FROM MGrupo WHERE id_grp = ?",
                [grupo]
            );
            const id_lista = await pool.query(
                "SELECT id_lst FROM ELista WHERE id_grp = ?",
                [grupo]
            );
            var id_e = [];
            for (let i = 0; i < id_lista.length; i++) {
                const miembro = id_lista[i].id_lst;
                id_e.push(miembro);
            }
            var listas = [];
            for (let i = 0; i < id_e.length; i++) {
                const miembro = id_e[i];
                const list = await pool.query(
                    "SELECT * FROM MLista WHERE id_lis = ?",
                    [miembro]
                    );
                listas.push(list[0]);
            }


            res.redirect('/consultarlistas/' + grupo);
            
            
        } catch (err) {
            res.redirect('/error');
            console.log(err);
        }
    },async grupo(req, res) {
        const idg = req.params.id_grp;
        res.render("crearListaDeGrupo",{
            grupo: idg
        });
    }, async editarLista(req, res){
        const {idl} = req.body;
        const { nombre } = req.body;
        
        let newList = [nombre, idl];
        try {
            await pool.query(
                "UPDATE MLista set nom_lis = ? where id_lis = ?",
                newList
            );
            res.render("consultarListaDeGrupo");
        } catch (err) {
            res.redirect('/error');
            console.log(err);
        }
    },
    async borrarLista(req, res){
        const idl = req.params.id_lis;
        const grp = req.params.id_grp;
        try {
            await pool.query(
                "DELETE from ELista where id_lst = ?",
                idl
            );
            await pool.query(
                "DELETE from MLista where id_lis = ?",
                idl
            );
            
            res.redirect("/consultarlistas/"+grp);
        } catch (err) {
            res.redirect('/error');
            console.log(err);
        }
    }, 
    async ConsultarListas(req, res){
        try {
            let preview = new Array();
            const idgrupo = req.params.id_grp;
            const nomGrp = await pool.query(
                "SELECT nom_grp FROM MGrupo WHERE id_grp = ?",
                [idgrupo]
            );
            const grupo = nomGrp[0].nom_grp;
            const id_lista = await pool.query(
                "SELECT id_lst FROM ELista WHERE id_grp = ?",
                [idgrupo]
            );
            var id_e = [];
            for (let i = 0; i < id_lista.length; i++) {
                const miembro = id_lista[i].id_lst;
                id_e.push(miembro);
            }
            var listas = [];
            for (let i = 0; i < id_e.length; i++) {
                const miembro = id_e[i];
                const list = await pool.query(
                    "SELECT * FROM MLista WHERE id_lis = ?",
                    [miembro]
                    );
                listas.push(list[0]);
            }
            for(let a = 0; a < listas.length; a++){
                let id = await pool.query('select id_eli from elista where id_lst=' + listas[a].id_lis + ';');
                id = id[0].id_eli;
                let prodLista = await pool.query('select * from dproducto where id_eli=' + id + ';');
                for(var i = 0; i < 2; i++){
                    if(prodLista[i] == undefined){
                        preview.push('estoesuntextolargocomoplaceholder');
                    }else{
                        preview.push(prodLista[i]);
                    }
                }
            };
            res.render("consultarListasDeGrupo", {
                listas: listas,
                idgrupo: idgrupo,
                nombre: grupo,
                preview
            });
            
        } catch (err) {
            res.redirect('/error');
            console.log(err);
        }
    },
    async DuplicarLista(req, res){
        try {
            const idg = req.params.id_grp;
            const idl = req.params.id_lis;
        
            const Clista = await pool.query(
                "select nom_lis from mlista where id_lis = ?",
                [idl]
            );
            const Edup = await pool.query(
                "select id_eli from elista where id_lst = ?",
                [idl]
            );
            
            const Nombre = Clista[0].nom_lis;
            await pool.query(
                "INSERT INTO mlista (nom_lis, fec_lis, id_esList, tot_list) VALUES (?,CURDATE(),1,0.0)",
                [Nombre]
            );
            const id_lista = await pool.query(
                "select id_lis from mlista where id_lis = (select MAX(id_lis) from mlista)",
                
            );
            await pool.query(
                "INSERT INTO ELista (id_grp, id_lst) VALUES (?,?)",
                [idg, id_lista]
            );
            const id_elista = await pool.query(
                "select id_eli from ELista where id = (select MAX(id_eli) from mlista)",
                
            );
            const Plista = await pool.query(
                "select * from DProducto where id_eli = ?",
                Edup
            );
            for (let i = 0; i < Plista.length; i++) {
                const nombre = Plista[i].nom_pro;
                const marca = Plista[i].id_marca;
                const sup = plista[i].id_sup;
                const dep = plista[i].id_dep;
                const uni = plista[i].id_uni;
                const can = plista[i].can_pro;
                const precio = plista[i].precio_pro;
                const notas = plista[i].notas_pro;
                const tipo = plista[i].id_tip;

                var datoslista = await pool.query(
                    "INSERT INTO dproducto (id_eli, nom_pro, id_mar, id_sup, id_dep, id_uni, can_pro, precio_pro, notas_pro, id_tip, id_esp) VALUES (?,?,?,?,?,?,?,?,?,?,1)",
                    [id_elista, nombre, marca, sup, dep, uni, can, precio, notas, tipo]
                );
            }
            res.redirect("/consultarlistas/"+idg);
        } catch (err) {
            res.redirect('/error');
            console.log(err);
        }
    }
};
