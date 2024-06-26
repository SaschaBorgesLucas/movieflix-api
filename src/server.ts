import express from "express";
import { PrismaClient } from "@prisma/client";
import swaggerUI from "swagger-ui-express";
import swaggerDocument from "../swagger.json";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument))

app.get("/movies", async ( _, response) =>{
    const movie = await prisma.movie.findMany({
        orderBy: { 
            title: 'asc', 
        },
        include: { 
            genres: true, 
            languages: true,
        },
    });

    response.json(movie)
});

app.post("/movies", async(request, response)=>{
    
    const{ title, id_genre, id_language, oscar_count, release_date} = request.body;
    
    console.log(`Conteúdo enviado na requisição${request.body}`)

    try{

        const movieWithSameTitle = await prisma.movie.findFirst({
            where:{ 
                title: { equals: title, mode: "insensitive" }
            }
        })

        if(movieWithSameTitle){
            return response.status(409).send({message:"filme duplicado"});
        }

        await prisma.movie.create({
        data:{
            title,
            id_genre,
            id_language,
            oscar_count,
            release_date: new Date(release_date)
        }
    });
    }
    catch(error){
        return response.status(500).send({message:"Erro ao cadastrar o filme"});
    }
    response.status(201).send();

});

app.put("/movies/:id", async (request, response)=>{
    try{
        const id = Number( request.params.id);
        const movie = await prisma.movie.findUnique({where:{ id }});
        
        if ( !movie ){

            return response.status (404).send({ message: "Filme não encontrado" });

        }

        const data = {... request.body};
        data.release_date = data.release_date ? new Date(data.release_date) : undefined;
        await prisma.movie.update({ where:{ id }, data });
        response.status(200).send();

    }
    catch (error)
    {
        return response.status(500).send({ message: "Falha ao atualizar o registro" });
    }
});

app.delete("/movies/:id", async( request, response )=>{
    try{
        const id = Number(request.params.id);

        const movie = await prisma.movie.findUnique({where:{ id }});
            
        if ( !movie ){

            return response.status (404).send({ message: "Filme não encontrado" });

        }

        await prisma.movie.delete({where:{id}});
        response.status(200);
    }
    catch(error){
        return response.status(500).send({ message: "Falha ao deletar o registro" });
    }
});


app.get("/movies/:genreName", async ( request , response) =>{
    try{
        const filterByGenreName = await prisma.movie.findMany({
            include: { 
                genres: true, 
                languages: true,
            },
            where:{
                genres:{
                    name:{ 
                        equals: request.params.genreName,
                        mode: 'insensitive',
                    }
                }
            }
        });
        response.status(200).send(filterByGenreName);
        }
    catch(error){
        return response.status (500).send({ message: "Filmes não encontrados"});
    }
});





app.listen(port, ()=>{
    console.log(`servidor em execução na porta ${port}`);
});