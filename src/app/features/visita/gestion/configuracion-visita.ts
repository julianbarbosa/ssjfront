import { ConfiguracionFormulario } from '../../../core/services/visita-limpia.service';

/**
 * Presentación de la pantalla de gestión de visita.
 * Solo completa encabezados de categorías cuya API no los trae; las que sí los
 * traen usan los suyos. Las columnas se llenan en el orden en que llegan los campos.
 */
export const configuracionVisita: ConfiguracionFormulario = {
  clasePorTipo: (tipo, soloLectura) =>
    (tipo === 'texto-min' || tipo === 'texto-corto') && !soloLectura ? 'col-md-6' : null,
  encabezadosPorCategoria: {
    56: ['Ítem', 'Aprobado en planos', 'Verificado en obra'],
  },
};
