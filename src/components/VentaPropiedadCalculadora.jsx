import React, { useState, useEffect, useMemo } from 'react';

/**
 * Ejemplo de archivo con estilos en línea e implementación de un diseño 
 * similar al que manejabas antes, pero asegurándonos de usar 
 * 'porcentajeNotarialesVendedor' en el cálculo para no disparar la 
 * advertencia de ESLint.
 */
export default function VentaPropiedadCalculadora() {
  // Valor de venta y valor catastral
  const [valorVenta, setValorVenta] = useState(440000000);
  const valorAdquisicion = 362514000; // Avalúo catastral
  
  // Propietarios y sus porcentajes
  const propietarios = useMemo(() => [
    { nombre: 'Isabel', porcentaje: 25 },
    { nombre: 'Laura', porcentaje: 56.25 },
    { nombre: 'Patricia', porcentaje: 6.25 },
    { nombre: 'Ruth', porcentaje: 6.25 },
    { nombre: 'Mauricio', porcentaje: 6.25 }
  ], []);

  // Parámetros ajustables
  const [porcentajeComision, setPorcentajeComision] = useState(3);
  const [porcentajeGananciaOcasional, setPorcentajeGananciaOcasional] = useState(12.5);

  // Constantes fijas
  const retencionFuentePorc = 1;         // 1%
  const gastosNotarialesPorc = 0.54;     // 0.54% total
  const porcentajeNotarialesVendedor = gastosNotarialesPorc / 2; // 0.27% p/vendedor
  const honorariosNotarialesPorc = 0.5;  // 0.5%
  const ivaSobreHonorarios = 0.19;       // 19%

  // Estado para cálculos
  const [calculos, setCalculos] = useState({
    gananciaSujetaImpuesto: 0,
    gastosPorPropietario: [],
    montoNetoPorPropietario: [],
    totales: { gastosVendedores: 0, montoNetoTotal: 0, impuestoGananciaTotal: 0 }
  });

  // Efecto para recalcular
  useEffect(() => {
    const gananciaSujetaImpuesto = valorVenta - valorAdquisicion;
    const comisionAgente = valorVenta * (porcentajeComision / 100);
    const impuestoGanancia = gananciaSujetaImpuesto * (porcentajeGananciaOcasional / 100);
    const retencionFuente = valorVenta * (retencionFuentePorc / 100);

    // Gastos notariales totales (0.54%), la mitad la asume el vendedor
    const gastosNotariales = valorVenta * (gastosNotarialesPorc / 100);
    // Lo que asume el vendedor
    const gastosNotarialesVendedor = valorVenta * (porcentajeNotarialesVendedor / 100);

    // Honorarios + IVA
    const honorariosNotariales = valorVenta * (honorariosNotarialesPorc / 100);
    const ivaHonorarios = honorariosNotariales * ivaSobreHonorarios;

    // Cálculo individual
    const gastosPorPropietario = propietarios.map(prop => {
      const factor = prop.porcentaje / 100;
      const comisionProp = comisionAgente * factor;
      const impuestoProp = impuestoGanancia * factor;
      const retencionProp = retencionFuente * factor;
      const notarialesProp = gastosNotarialesVendedor * factor;
      const honorariosProp = honorariosNotariales * factor;
      const ivaProp = ivaHonorarios * factor;

      const totalGastosProp = comisionProp + impuestoProp + retencionProp
        + notarialesProp + honorariosProp + ivaProp;

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

    // Monto neto para cada propietario
    const montoNetoPorPropietario = gastosPorPropietario.map((prop, idx) => {
      const valorBruto = valorVenta * (propietarios[idx].porcentaje / 100);
      return {
        nombre: prop.nombre,
        valorBruto,
        totalGastos: prop.totalGastos,
        impuestoGanancia: prop.impuestoGanancia,
        montoNeto: valorBruto - prop.totalGastos
      };
    });

    // Totales
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
    porcentajeNotarialesVendedor // Lo agregamos para que re-calcule si lo cambiamos
  ]);

  // Formateo a moneda COP
  const formatCOP = (valor) => new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(valor);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>VentaPropiedadCalculadora</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label>Valor de Venta:</label>
        <input
          type="number"
          value={valorVenta}
          onChange={(e) => setValorVenta(parseFloat(e.target.value) || 0)}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Comisión Agente ({porcentajeComision}%):</label>
        <input
          type="range"
          min="3"
          max="3.5"
          step="0.1"
          value={porcentajeComision}
          onChange={(e) => setPorcentajeComision(parseFloat(e.target.value))}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Ganancia Ocasional ({porcentajeGananciaOcasional}%):</label>
        <input
          type="range"
          min="10"
          max="30"
          step="1"
          value={porcentajeGananciaOcasional}
          onChange={(e) => setPorcentajeGananciaOcasional(parseFloat(e.target.value))}
        />
      </div>

      <hr />

      <h2>Tabla 1: Resumen General</h2>
      <p>
        Gastos Notariales Vendedor = {formatCOP(valorVenta * (porcentajeNotarialesVendedor / 100))}
      </p>

      <h2>Tabla 2: Gastos Individuales</h2>
      <table>
        <thead>
          <tr>
            <th>Propietario</th>
            <th>Comisión</th>
            <th>Ganancia Ocasional</th>
            <th>Retención</th>
            <th>G. Notariales</th>
            <th>Honorarios</th>
            <th>IVA Honorarios</th>
            <th>Total Gastos</th>
          </tr>
        </thead>
        <tbody>
          {calculos.gastosPorPropietario.map((p, idx) => (
            <tr key={idx}>
              <td>{p.nombre} ({p.porcentaje}%)</td>
              <td>{formatCOP(p.comisionAgente)}</td>
              <td>{formatCOP(p.impuestoGanancia)}</td>
              <td>{formatCOP(p.retencionFuente)}</td>
              <td>{formatCOP(p.gastosNotariales)}</td>
              <td>{formatCOP(p.honorariosNotariales)}</td>
              <td>{formatCOP(p.ivaHonorarios)}</td>
              <td>{formatCOP(p.totalGastos)}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={7}>Total Vendedor</td>
            <td>{formatCOP(calculos.totales.gastosVendedores)}</td>
          </tr>
        </tbody>
      </table>

      <h2>Tabla 3: Montos Netos</h2>
      <table>
        <thead>
          <tr>
            <th>Propietario</th>
            <th>Bruto</th>
            <th>Total Gastos</th>
            <th>Neto</th>
          </tr>
        </thead>
        <tbody>
          {calculos.montoNetoPorPropietario.map((p, idx) => (
            <tr key={idx}>
              <td>{p.nombre}</td>
              <td>{formatCOP(p.valorBruto)}</td>
              <td>{formatCOP(p.totalGastos)}</td>
              <td>{formatCOP(p.montoNeto)}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={3}>Neto Total Vendedores</td>
            <td>{formatCOP(calculos.totales.montoNetoTotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
