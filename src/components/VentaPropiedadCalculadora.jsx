import React, { useState, useEffect, useMemo } from 'react';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
}

function getStyles(isMobile) {
  const primaryColor = '#2a79c8';
  const secondaryColor = '#5ea8f2';
  const highlightColor = '#d4ebfa';
  return {
    container: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      minHeight: '100vh',
      backgroundColor: '#f9f9f9',
      fontFamily: 'Arial, sans-serif'
    },
    mainContent: {
      flex: 1,
      padding: '2rem',
      overflowY: 'auto',
      order: isMobile ? 2 : 1
    },
    aside: {
      width: isMobile ? '100%' : '350px',
      background: `linear-gradient(135deg, ${secondaryColor}, ${primaryColor})`,
      color: '#fff',
      padding: '2rem',
      boxShadow: isMobile ? 'none' : '-2px 0 8px rgba(0,0,0,0.2)',
      position: isMobile ? 'relative' : 'sticky',
      top: 0,
      height: isMobile ? 'auto' : '100vh',
      order: isMobile ? 1 : 2
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '2rem',
      color: '#333'
    },
    tableContainer: {
      marginBottom: '3rem',
      overflowX: 'auto'
    },
    tableTitle: {
      fontSize: '1.8rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      color: '#444'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
    },
    th: {
      background: `linear-gradient(135deg, #88c7f7, ${primaryColor})`,
      color: '#fff',
      padding: '0.75rem',
      border: '1px solid #ccc',
      textAlign: 'left'
    },
    td: {
      padding: '0.75rem',
      border: '1px solid #ccc'
    },
    trHighlight: {
      backgroundColor: highlightColor,
      fontWeight: 'bold'
    },
    notes: {
      fontSize: '0.9rem',
      color: '#666',
      fontStyle: 'italic',
      marginTop: '0.5rem'
    },
    asideTitle: {
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '1.5rem'
    },
    sliderContainer: {
      marginBottom: '1.5rem'
    },
    sliderLabel: {
      marginBottom: '0.5rem',
      fontSize: '1rem',
      fontWeight: 'bold'
    },
    slider: {
      width: '100%',
      appearance: 'none',
      height: '8px',
      borderRadius: '4px',
      background: '#bcdaf6',
      outline: 'none',
      transition: '0.3s'
    },
    inputNumber: {
      width: '100%',
      padding: '0.5rem',
      borderRadius: '4px',
      border: '1px solid #aaa',
      marginTop: '0.5rem'
    },
    highlightBox: {
      background: '#fff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      borderRadius: '4px',
      padding: '1rem',
      marginBottom: '1rem'
    },
    highlightTitle: {
      fontWeight: 'bold',
      marginBottom: '0.2rem'
    },
    highlightValue: {
      fontSize: '1.4rem',
      color: primaryColor,
      fontWeight: 'bold'
    },
    notesContainer: {
      marginTop: '1rem',
      background: '#fffbe5',
      padding: '1rem',
      borderRadius: '4px'
    }
  };
}

export default function VentaPropiedadCalculadora() {
  const isMobile = useIsMobile();
  const styles = getStyles(isMobile);

  const [valorVenta, setValorVenta] = useState(440000000);
  const valorAdquisicion = 362514000;

  const propietarios = useMemo(() => [
    { nombre: 'Isabel', porcentaje: 25 },
    { nombre: 'Laura', porcentaje: 56.25 },
    { nombre: 'Patricia', porcentaje: 6.25 },
    { nombre: 'Ruth', porcentaje: 6.25 },
    { nombre: 'Mauricio', porcentaje: 6.25 }
  ], []);

  const [porcentajeComision, setPorcentajeComision] = useState(3);
  const [porcentajeGananciaOcasional, setPorcentajeGananciaOcasional] = useState(12.5);

  const retencionFuentePorc = 1;
  const gastosNotarialesPorc = 0.54;
  const porcentajeNotarialesVendedor = gastosNotarialesPorc / 2; // 0.27%
  const honorariosNotarialesPorc = 0.5;
  const ivaSobreHonorarios = 0.19;

  const [calculos, setCalculos] = useState({
    gananciaSujetaImpuesto: 0,
    gastosPorPropietario: [],
    montoNetoPorPropietario: [],
    totales: { gastosVendedores: 0, montoNetoTotal: 0, impuestoGananciaTotal: 0 }
  });

  useEffect(() => {
    const gananciaSujetaImpuesto = valorVenta - valorAdquisicion;
    const comisionAgente = valorVenta * (porcentajeComision / 100);
    const impuestoGanancia = gananciaSujetaImpuesto * (porcentajeGananciaOcasional / 100);
    const retencionFuente = valorVenta * (retencionFuentePorc / 100);
    const gastosNotarialesVendedorValue = valorVenta * (porcentajeNotarialesVendedor / 100);
    const honorariosNotariales = valorVenta * (honorariosNotarialesPorc / 100);
    const ivaHonorarios = honorariosNotariales * ivaSobreHonorarios;

    const gastosPorPropietario = propietarios.map(prop => {
      const factor = prop.porcentaje / 100;
      const comisionProp = comisionAgente * factor;
      const impuestoProp = impuestoGanancia * factor;
      const retencionProp = retencionFuente * factor;
      const notarialesProp = gastosNotarialesVendedorValue * factor;
      const honorariosProp = honorariosNotariales * factor;
      const ivaProp = ivaHonorarios * factor;
      const totalGastosProp = comisionProp + impuestoProp + retencionProp + notarialesProp + honorariosProp + ivaProp;
      return {
        nombre: prop.nombre,
        porcentaje: prop.porcentaje,
        comisionAgente: comisionProp,
        impuestoGanancia: impuestoProp,
        retencionFuente: retencionProp,
        gastosNotariales: notarialesProp,
        honorariosNotariales: honorariosProp,
        ivaHonorarios: ivaProp,
        totalGastos: totalGastosProp
      };
    });

    const montoNetoPorPropietario = propietarios.map((prop, idx) => {
      const valorBruto = valorVenta * (prop.porcentaje / 100);
      const totalGastos = gastosPorPropietario[idx].totalGastos;
      return {
        nombre: prop.nombre,
        valorBruto,
        totalGastos,
        impuestoGanancia: gastosPorPropietario[idx].impuestoGanancia,
        montoNeto: valorBruto - totalGastos
      };
    });

    const totalGastosVendedores = gastosPorPropietario.reduce((acc, p) => acc + p.totalGastos, 0);
    const totalNetoVendedores = montoNetoPorPropietario.reduce((acc, p) => acc + p.montoNeto, 0);
    const totalImpuestoGanancia = gastosPorPropietario.reduce((acc, p) => acc + p.impuestoGanancia, 0);

    setCalculos({
      gananciaSujetaImpuesto,
      gastosPorPropietario,
      montoNetoPorPropietario,
      totales: {
        gastosVendedores: totalGastosVendedores,
        montoNetoTotal: totalNetoVendedores,
        impuestoGananciaTotal: totalImpuestoGanancia
      }
    });
  }, [
    valorVenta,
    porcentajeComision,
    porcentajeGananciaOcasional,
    propietarios,
    valorAdquisicion,
    porcentajeNotarialesVendedor
  ]);

  const formatCOP = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  };

  return (
    <div style={styles.container}>
      {/* MAIN CONTENT */}
      <div style={styles.mainContent}>
        <h1 style={styles.title}>Resumen de Venta Pte Aranda</h1>

        {/* Tabla 1: Resumen General de Gastos */}
        <div style={styles.tableContainer}>
          <h2 style={styles.tableTitle}>Tabla 1: Resumen General de los Gastos</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Concepto</th>
                <th style={styles.th}>Porcentaje Aplicado</th>
                <th style={styles.th}>Valor Total (COP)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}>Comisión del Agente Inmobiliario</td>
                <td style={styles.td}>{porcentajeComision}%</td>
                <td style={styles.td}>{formatCOP(valorVenta * (porcentajeComision / 100))}</td>
              </tr>
              <tr>
                <td style={styles.td}>Retención en la Fuente</td>
                <td style={styles.td}>1%</td>
                <td style={styles.td}>{formatCOP(valorVenta * 0.01)}</td>
              </tr>
              <tr>
                <td style={styles.td}>Gastos Notariales</td>
                <td style={styles.td}>0.27%</td>
                <td style={styles.td}>{formatCOP(valorVenta * (porcentajeNotarialesVendedor / 100))}</td>
              </tr>
              <tr>
                <td style={styles.td}>Honorarios Notariales</td>
                <td style={styles.td}>0.5%</td>
                <td style={styles.td}>{formatCOP(valorVenta * (honorariosNotarialesPorc / 100))}</td>
              </tr>
              <tr>
                <td style={styles.td}>IVA sobre Honorarios</td>
                <td style={styles.td}>19% sobre honorarios</td>
                <td style={styles.td}>{formatCOP(valorVenta * (honorariosNotarialesPorc / 100) * ivaSobreHonorarios)}</td>
              </tr>
              <tr>
                <td style={styles.td}>Impuesto de Ganancia Ocasional</td>
                <td style={styles.td}>
                  {porcentajeGananciaOcasional}% sobre ganancia neta
                </td>
                <td style={styles.td}>
                  {formatCOP((valorVenta - valorAdquisicion) * (porcentajeGananciaOcasional / 100))}
                </td>
              </tr>
              <tr style={styles.trHighlight}>
                <td style={styles.td}>Total Gastos Generales</td>
                <td style={styles.td}></td>
                <td style={styles.td}>
                  {formatCOP(
                    valorVenta * (porcentajeComision / 100) +
                    valorVenta * 0.01 +
                    valorVenta * (porcentajeNotarialesVendedor / 100) +
                    valorVenta * (honorariosNotarialesPorc / 100) * (1 + ivaSobreHonorarios) +
                    (valorVenta - valorAdquisicion) * (porcentajeGananciaOcasional / 100)
                  )}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" style={{ padding: '0.5rem', fontSize: '0.9rem', color: '#666', fontStyle: 'italic', borderTop: '1px solid #ccc' }}>
                  * El impuesto de Ganancia Ocasional se calcula sobre la ganancia neta, es decir, (Valor de Venta - Avalúo Catastral: {formatCOP(valorAdquisicion)}).
                </td>
              </tr>
            </tfoot>
          </table>
          <p style={styles.notes}>* El impuesto de Ganancia Ocasional se declara en la declaración de renta del próximo año.</p>
        </div>

        {/* Tabla 2: Gastos Individuales */}
        <div style={styles.tableContainer}>
          <h2 style={styles.tableTitle}>Tabla 2: Gastos Individuales según Participación</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Propietario</th>
                <th style={styles.th}>Comisión Agente</th>
                <th style={styles.th}>Ganancia Ocasional*</th>
                <th style={styles.th}>Retención Fuente</th>
                <th style={styles.th}>Gastos Notariales</th>
                <th style={styles.th}>Honorarios Notariales</th>
                <th style={styles.th}>IVA Honorarios</th>
                <th style={styles.th}>Total Gastos</th>
              </tr>
            </thead>
            <tbody>
              {calculos.gastosPorPropietario.map((prop, idx) => (
                <tr key={idx}>
                  <td style={styles.td}>{prop.nombre} ({prop.porcentaje}%)</td>
                  <td style={styles.td}>{formatCOP(prop.comisionAgente)}</td>
                  <td style={styles.td}>{formatCOP(prop.impuestoGanancia)}</td>
                  <td style={styles.td}>{formatCOP(prop.retencionFuente)}</td>
                  <td style={styles.td}>{formatCOP(prop.gastosNotariales)}</td>
                  <td style={styles.td}>{formatCOP(prop.honorariosNotariales)}</td>
                  <td style={styles.td}>{formatCOP(prop.ivaHonorarios)}</td>
                  <td style={styles.td}>{formatCOP(prop.totalGastos)}</td>
                </tr>
              ))}
              <tr style={styles.trHighlight}>
                <td style={styles.td}>Total</td>
                <td style={styles.td}>{formatCOP(calculos.gastosPorPropietario.reduce((acc, p) => acc + p.comisionAgente, 0))}</td>
                <td style={styles.td}>{formatCOP(calculos.gastosPorPropietario.reduce((acc, p) => acc + p.impuestoGanancia, 0))}</td>
                <td style={styles.td}>{formatCOP(calculos.gastosPorPropietario.reduce((acc, p) => acc + p.retencionFuente, 0))}</td>
                <td style={styles.td}>{formatCOP(calculos.gastosPorPropietario.reduce((acc, p) => acc + p.gastosNotariales, 0))}</td>
                <td style={styles.td}>{formatCOP(calculos.gastosPorPropietario.reduce((acc, p) => acc + p.honorariosNotariales, 0))}</td>
                <td style={styles.td}>{formatCOP(calculos.gastosPorPropietario.reduce((acc, p) => acc + p.ivaHonorarios, 0))}</td>
                <td style={styles.td}>{formatCOP(calculos.totales.gastosVendedores)}</td>
              </tr>
            </tbody>
          </table>
          <p style={styles.notes}>* El impuesto de Ganancia Ocasional se paga en la declaración de renta del próximo año.</p>
        </div>

        {/* Tabla 3: Totalización por Grupo Familiar */}
        <div style={styles.tableContainer}>
          <h2 style={styles.tableTitle}>Tabla 3: Totalización de Montos Netos</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Grupo</th>
                <th style={styles.th}>Monto Bruto por Venta</th>
                <th style={styles.th}>Gastos Totales</th>
                <th style={styles.th}>Monto Neto a Recibir</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}>Laura</td>
                <td style={styles.td}>{formatCOP(valorVenta * (56.25 / 100))}</td>
                <td style={styles.td}>
                  {formatCOP(
                    calculos.gastosPorPropietario.find(p => p.nombre === 'Laura')?.totalGastos || 0
                  )}
                </td>
                <td style={styles.td}>
                  {formatCOP(
                    calculos.montoNetoPorPropietario.find(p => p.nombre === 'Laura')?.montoNeto || 0
                  )}
                </td>
              </tr>
              <tr>
                <td style={styles.td}>Chava (Isabel, Patricia, Ruth y Mauricio)</td>
                <td style={styles.td}>
                  {formatCOP(
                    valorVenta * ((25 + 6.25 + 6.25 + 6.25) / 100)
                  )}
                </td>
                <td style={styles.td}>
                  {formatCOP(
                    calculos.gastosPorPropietario.filter(p => p.nombre !== 'Laura')
                      .reduce((sum, p) => sum + p.totalGastos, 0)
                  )}
                </td>
                <td style={styles.td}>
                  {formatCOP(
                    calculos.montoNetoPorPropietario.filter(p => p.nombre !== 'Laura')
                      .reduce((sum, p) => sum + p.montoNeto, 0)
                  )}
                </td>
              </tr>
            </tbody>
          </table>
          <p style={styles.notes}>
            Nota: Si Isabel no paga el impuesto de Ganancia Ocasional (por no declarar renta y por haber vivido allí siempre), su parte se suma al total de "Chava".
          </p>
        </div>

        {/* Resumen de la Transacción */}
        <div style={{ backgroundColor: '#f0f8ff', padding: '1.5rem', borderRadius: '5px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>Resumen de la Transacción</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={styles.highlightBox}>
              <p style={styles.highlightTitle}>Valor de Venta:</p>
              <p style={styles.highlightValue}>{formatCOP(valorVenta)}</p>
            </div>
            <div style={styles.highlightBox}>
              <p style={styles.highlightTitle}>Avalúo Catastral:</p>
              <p style={styles.highlightValue}>{formatCOP(valorAdquisicion)}</p>
            </div>
            <div style={styles.highlightBox}>
              <p style={styles.highlightTitle}>Ganancia Sujeta a Impuesto:</p>
              <p style={styles.highlightValue}>{formatCOP(calculos.gananciaSujetaImpuesto)}</p>
            </div>
            <div style={styles.highlightBox}>
              <p style={styles.highlightTitle}>Total Gastos Vendedores:</p>
              <p style={styles.highlightValue}>{formatCOP(calculos.totales.gastosVendedores)}</p>
            </div>
            <div style={styles.highlightBox}>
              <p style={styles.highlightTitle}>Total Impuesto Ganancia Ocasional:</p>
              <p style={styles.highlightValue}>{formatCOP(calculos.totales.impuestoGananciaTotal)}</p>
            </div>
            <div style={styles.highlightBox}>
              <p style={styles.highlightTitle}>Monto Neto Total a Recibir:</p>
              <p style={{ fontSize: '1.6rem', color: '#008000', fontWeight: 'bold' }}>
                {formatCOP(calculos.totales.montoNetoTotal)}
              </p>
            </div>
          </div>
          <div style={styles.notesContainer}>
            <strong>Notas importantes:</strong>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', color: '#666' }}>
              <li>
                La comisión es un pago único del <strong>{porcentajeComision}%</strong> (negociable hasta 3.5%) sobre el valor total de venta, y puede ser obtenida por cualquier familiar o tercero que consiga el comprador.
              </li>
              <li>
                El impuesto de Ganancia Ocasional (calculado al <strong>{porcentajeGananciaOcasional}%</strong> sobre la ganancia neta) se declara y paga en la declaración de renta del próximo año. La ganancia neta es la diferencia entre el valor de venta y el avalúo catastral ({formatCOP(valorAdquisicion)}).
              </li>
              <li>
                Algunos propietarios, como Chavela y Pato, podrían estar exentos o pagar menos este impuesto (por ejemplo, si no declara renta y ha vivido allí siempre).
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sidebar Fijo */}
      <aside style={styles.aside}>
        <h2 style={styles.asideTitle}>Ajustes y Datos</h2>
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>Datos de la Venta</h3>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Valor de Venta:</label>
          <input
            type="number"
            style={styles.inputNumber}
            value={valorVenta}
            onChange={(e) => setValorVenta(parseFloat(e.target.value) || 0)}
          />
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Avalúo Catastral:</label>
            <div style={{ backgroundColor: '#d3e7ff', padding: '0.5rem', borderRadius: '4px', color: '#033c8c' }}>
              {formatCOP(valorAdquisicion)}
            </div>
            <p style={{ fontSize: '0.9rem', marginTop: '0.3rem' }}>📍 Valor catastral actualizado</p>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontWeight: 'bold' }}>Ganancia Sujeta a Impuesto:</p>
            <p style={{ fontSize: '1.2rem', color: '#fff' }}>{formatCOP(calculos.gananciaSujetaImpuesto)}</p>
          </div>
        </div>
        <div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>Ajustes de Porcentajes</h3>
          <div style={styles.sliderContainer}>
            <label style={styles.sliderLabel}>Comisión Agente ({porcentajeComision}%):</label>
            <input
              type="range"
              min="3"
              max="3.5"
              step="0.1"
              style={styles.slider}
              value={porcentajeComision}
              onChange={(e) => setPorcentajeComision(parseFloat(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '0.3rem' }}>
              <span>3%</span>
              <span>3.5%</span>
            </div>
          </div>
          <div style={styles.sliderContainer}>
            <label style={styles.sliderLabel}>Impuesto de Ganancia Ocasional ({porcentajeGananciaOcasional}%):</label>
            <input
              type="range"
              min="10"
              max="30"
              step="1"
              style={styles.slider}
              value={porcentajeGananciaOcasional}
              onChange={(e) => setPorcentajeGananciaOcasional(parseFloat(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '0.3rem' }}>
              <span>10%</span>
              <span>30%</span>
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', fontStyle: 'italic', marginTop: '1rem' }}>
            * Los ajustes se actualizan automáticamente en las tablas.
          </p>
        </div>
      </aside>
    </div>
  );
}
