describe('Prueba serie List', () => {
    beforeEach(() => {
      cy.visit('/')
    })
  
    let seriesFromBackend: string | any[] = [];
   
      it('get back',()=> {
        cy.request('GET', 'http://localhost:8080/api/series')
          .then((response) => {
            expect(response.status).to.eq(200);
            seriesFromBackend = response.body;
            cy.log(`Se obtuvieron ${seriesFromBackend.length} libros del backend`);
          });
      });
  
   
      it('should display the serie list', () => {
        cy.get('app-serie-list').should('exist');
        cy.log('La página de series cargó correctamente');
    });
   
   
      it('should display the correct number of series', () => {
        cy.get('div.col.mb-2')
          .should('have.length', seriesFromBackend.length)
          .then(() => {
            cy.log(`Se muestran ${seriesFromBackend.length} libros en la vista`);
          });
      });
  
      it('should have the correct number of <div.card.p-2> elements', () => {
          cy.get('div.card.p-2').should('have.length', seriesFromBackend.length);
        });
   
        it('should have the correct number of <img> elements', () => {
          cy.get('img').should('have.length', seriesFromBackend.length);
        });
   
        it('should have the correct number of <div.card-body> elements', () => {
          cy.get('div.card-body').should('have.length', seriesFromBackend.length);
        });
   
      it('should display correct image src and alt attributes', () => {
        cy.get('img').each(($img, index) => {
          cy.wrap($img)
            .should('have.attr', 'src', seriesFromBackend[index].foto)
            .should('have.attr', 'alt', seriesFromBackend[index].name)
            .then(() => {
              cy.log(`Imagen correcta para el libro: ${seriesFromBackend[index].name}`);
            });
        });
      });
   
      it('should have h5 tag with the serie.name', () => {
        cy.get('h5.card-title').each(($title, index) => {
          cy.wrap($title)
            .should('contain.text', seriesFromBackend[index].name)
            .then(() => {
              cy.log(`Título correcto: ${seriesFromBackend[index].name}`);
            });
        });
      });
   
      it('should have p tag with the serie.editorial.name', () => {
        cy.get('p.card-text').each(($p, index) => {
          cy.wrap($p)
            .should('contain.text', seriesFromBackend[index].channel)
            .then(() => {
              cy.log(`Canal correcta para el libro ${seriesFromBackend[index].name}: ${seriesFromBackend[index].channel}`);
            });
        });
      });
   
      //No se pueden borrar libros si tiene autor asociado
      it('should correctly update the serie list if a serie is removed', () => {
        cy.request('GET', 'https://gist.githubusercontent.com/josejbocanegra/8490b48961a69dcd2bfd8a360256d0db/raw/34ff30dbc32392a69eb0e08453a3fc975a3890f0/series.json')
          .then((response) => {
            expect(response.status).to.eq(200);
            const series = response.body;
   
            cy.log(`Total de libros antes de eliminar: ${series.length}`);
   
            // Filtrar los libros que no tienen autores
            const serieWithoutAuthors = series.find((serie: { authors: string | any[]; }) => !serie.authors || serie.authors.length === 0);
   
            if (!serieWithoutAuthors) {
              cy.log('No hay libros sin autores disponibles para eliminar');
              return;
            }
   
            cy.log(`Eliminando el libro: ${serieWithoutAuthors.name} (ID: ${serieWithoutAuthors.id})`);
   
            // Intentamos eliminar el libro sin autores
            cy.request({
              method: 'DELETE',
              url: `http://localhost:8080/api/series/${serieWithoutAuthors.id}`,
              failOnStatusCode: false,
            }).then((deleteResponse) => {
              expect(deleteResponse.status).to.be.oneOf([200, 204]);
   
              cy.log(`Libro eliminado con éxito: ${serieWithoutAuthors.name}`);
   
              //Verificamos que el libro ya no esté en la lista
              cy.reload();
              cy.request('GET', 'http://localhost:8080/api/series')
                .then((updatedResponse) => {
                  expect(updatedResponse.status).to.eq(200);
                  const updatedseries = updatedResponse.body;
   
                  cy.log(`Total de libros después de eliminar: ${updatedseries.length}`);
   
                  cy.get('div.col.mb-2').should('have.length', updatedseries.length);
   
                  // Verificar que el libro eliminado ya no está en la vista
                  cy.get('div.col.mb-2').each(($serie) => {
                    cy.wrap($serie).should('not.contain.text', serieWithoutAuthors.name);
                  });
                });
            });
          });
      });
  })
  