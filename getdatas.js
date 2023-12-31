const  puppeteer  = require("puppeteer");
const fs = require("fs");

(async () => {
    console.log("Buscar filmes e series");
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();
     // Navigate the page to a URL
  await page.goto('https://redecanais.zip/browse.html');

  // Set screen size
  await page.setViewport({width: 1080, height: 1024});
  
  //pegar a lista de caterorias
  const categorias = await page.evaluate(()=>{
    //lista nomes
    let listNames = document.querySelectorAll("div.pm-li-category h3");
    listNames = Array.from(listNames).map(h3=>{return h3.innerHTML});
    //lista links
    let listLinks = document.querySelectorAll("div.pm-li-category a");
    listLinks = Array.from(listLinks).map(link=>{return  link.hasAttribute('href') ? link.getAttribute('href') : null;});

    //juntar as  listas {noma,link}
    let categorias = [];
    for(let i =0;i<listLinks.length;i++){
        categorias.push({name:listNames[i], link: listLinks[i]});
    }
    return categorias;
  })
  console.table(categorias);
  
  //ir para cada categora e pegas os dados 
  for(let c = 0;c<categorias.length;c++){
    await page.goto('https://redecanais.zip'+categorias[1].link);
    console.log("Categoria "+ categorias[1].name);
    let allThisCategoria = [];
    const nubPags  = await page.evaluate(()=>{
        let list  = document.querySelectorAll("div.col-md-12 ul.pagination  li a");
        let nubText = list[8].innerHTML;
      return Number(nubText);
      
    })
    for(let i =1;i<nubPags;i++){
        //filmes e series da pagina da tela atual
        const list = await page.evaluate(()=>{
            const listlinks = document.querySelectorAll("div.thumbnail a:not([class])");
            let listImg = document.querySelectorAll("div.thumbnail img");
            let listh3 = document.querySelectorAll("div.thumbnail h3 a");
            let links = [];
            for (var i = 0; i < listlinks.length; i++) {
                if (i % 2 === 0) {
                    links.push(listlinks[i]);
                }
            }
    
            links = Array.from(links).map(data=>data.getAttribute("href"));
            listImg = Array.from(listImg).map(data=>data.getAttribute("src"));
            listh3 = Array.from(listh3).map(data=>data.innerHTML);
    
            let list = [];
            for(let i =0;i<links.length;i++){
                list.push({name:listh3[i], link: links[i], img: listImg[i]});
            }
            return list;
    
        })
        await page.goto('https://redecanais.zip'+String(categorias[1].link).replace(/(\d+)(?=-date\.html)/, i+1));
        //console.log(list);
        allThisCategoria =[...allThisCategoria,...list];

  }
  console.log(allThisCategoria);
  fs.writeFile("./db/disneyplus.json", JSON.stringify(allThisCategoria,null,2), 'utf8', (err) => {
    if (err) {
        console.error('Erro ao escrever arquivo JSON:', err);
      } else {
        console.log(`Arquivo JSON "${categorias[1].name}" criado com sucesso.`);
      }
})
  


}
console.log("numero de paginas "+ nubPags);



})()
