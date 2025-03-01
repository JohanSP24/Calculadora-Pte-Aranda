import React, { useState, useEffect, useMemo } from 'react';

const VentaPropiedadCalculadora = () => {
  // Valor de venta y valor catastral actualizado (Avalúo Catastral 2024)
  const [valorVenta, setValorVenta] = useState(440000000);
  const valorAdquisicion = 362514000; // Valor catastral actualizado

  // Definición de propietarios con sus porcentajes:
  // Isabel 25%, Laura 56.25%, Patricia 6.25%, Ruth 6.25%, Mauricio 6.25%
  const propietarios = useMemo(() => [
    { nombre: 'Isabel', porcentaje: 25 },
    { nombre: 'Laura', porcentaje: 56.25 },
    { nombre: 'Patricia', porcentaje: 6.25 },
    { nombre: 'Ruth', porcentaje: 6.25 },
    { nombre: 'Mauricio', porcentaje: 6.25 }
  ], []);

  // Parámetros de la venta
  const [porcentajeComision, setPorcentajeComision] = useState(3); // Comisión base (negociable hasta 3.5%)
  const [porcentajeGananciaOcasional, setPorcentajeGananciaOcasional] = useState(12.5); // Actualizado al 12.5%

  // Constantes fijas de otros porcentajes
  const retencionFuentePorc = 1;      // 1%
  const gastosNotarialesPorc = 0.54;   // 0.54% total (se asume 50% para vendedor)
  const porcentajeNotarialesVendedor = gastosNotarialesPorc / 2; // 0.27%
  const honorariosNotarialesPorc = 0.5; // 0.5%
  const ivaSobreHonorarios = 0.19;     // 19%

  // Estado para almacenar los cálculos
  const [calculos, setCalculos] = useState({
    gananciaSujetaImpuesto: 0,
    gastosPorPropietario: [],
    montoNetoPorPropietario: [],
    totales: {
      gastosVendedores: 0,
      montoNetoTotal: 0,
      impuestoGananciaTotal: 0
    }
  });

  useEffect(() => {
    // Ganancia sujeta a impuesto: diferencia entre el valor de venta y el avalúo catastral
    const gananciaSujetaImpuesto = valorVenta - valorAdquisicion;
    
    // Cálculo de gastos generales basados en el valor de venta
    const comisionAgente = valorVenta * (porcentajeComision / 100);
    const impuestoGanancia = gananciaSujetaImpuesto * (porcentajeGananciaOcasional / 100);
    const retencionFuente = valorVenta * (retencionFuentePorc / 100);
    const gastosNotariales = valorVenta * (gastosNotarialesPorc / 100);
    const gastosNotarialesVendedor = gastosNotariales / 2;
    const honorariosNotariales = valorVenta * (honorariosNotarialesPorc / 100);
    const ivaHonorarios = honorariosNotariales * ivaSobreHonorarios;
    
    // Calcular gastos individuales para cada propietario (pago proporcional)
    const gastosPorPropietario = propietarios.map(prop => {
      const propPorc = prop.porcentaje / 100;
      const comisionProp = comisionAgente * propPorc;
      const impuestoProp = impuestoGanancia * propPorc;
      const retencionProp = retencionFuente * propPorc;
      const notarialesProp = gastosNotarialesVendedor * propPorc;
      const honorariosProp = honorariosNotariales * propPorc;
      const ivaProp = ivaHonorarios * propPorc;
      const totalGastosProp = comisionProp + retencionProp + notarialesProp + honorariosProp + ivaProp + impuestoProp;
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
    
    // Calcular el monto neto para cada propietario (valor bruto menos gastos)
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
    
    // Totales generales
    const totalGastosVendedores = gastosPorPropietario.reduce((acc, prop) => acc + prop.totalGastos, 0);
    const totalNetoVendedores = montoNetoPorPropietario.reduce((acc, prop) => acc + prop.montoNeto, 0);
    const totalImpuestoGanancia = gastosPorPropietario.reduce((acc, prop) => acc + prop.impuestoGanancia, 0);
    
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
    retencionFuentePorc,
    gastosNotarialesPorc,
    honorariosNotarialesPorc,
    ivaSobreHonorarios,
    valorAdquisicion
  ]);

  // Función para formatear números a moneda COP
  const formatCOP = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Contenido principal con tablas y resumen */}
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Resumen de Venta de Propiedad</h1>
        
        {/* Tabla 1: Resumen General de Gastos */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Tabla 1: Resumen General de los Gastos en los que Incurrimos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-blue-100">
                <tr>
                  <th className="p-2 border border-gray-300 text-left">Concepto</th>
                  <th className="p-2 border border-gray-300 text-right">Porcentaje Aplicado</th>
                  <th className="p-2 border border-gray-300 text-right">Valor Total (COP)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 border-r border-gray-300">Comisión del Agente Inmobiliario</td>
                  <td className="p-2 border-r border-gray-300 text-right">3%</td>
                  <td className="p-2 text-right border-gray-300">{formatCOP(valorVenta * (porcentajeComision / 100))}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 border-r border-gray-300">Retención en la Fuente</td>
                  <td className="p-2 border-r border-gray-300 text-right">1%</td>
                  <td className="p-2 text-right border-gray-300">{formatCOP(valorVenta * (retencionFuentePorc / 100))}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 border-r border-gray-300">Gastos Notariales</td>
                  <td className="p-2 border-r border-gray-300 text-right">0.27%</td>
                  <td className="p-2 text-right border-gray-300">{formatCOP(valorVenta * (porcentajeNotarialesVendedor / 100))}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 border-r border-gray-300">Honorarios Notariales</td>
                  <td className="p-2 border-r border-gray-300 text-right">0.5%</td>
                  <td className="p-2 text-right border-gray-300">{formatCOP(valorVenta * (honorariosNotarialesPorc / 100))}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 border-r border-gray-300">IVA sobre Honorarios</td>
                  <td className="p-2 border-r border-gray-300 text-right">19% sobre honorarios</td>
                  <td className="p-2 text-right border-gray-300">{formatCOP(valorVenta * (honorariosNotarialesPorc / 100) * ivaSobreHonorarios)}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 border-r border-gray-300">Impuesto de Ganancia Ocasional</td>
                  <td className="p-2 border-r border-gray-300 text-right">12.5% sobre ganancia neta</td>
                  <td className="p-2 text-right border-gray-300">
                    {formatCOP((valorVenta - valorAdquisicion) * (porcentajeGananciaOcasional / 100))}
                  </td>
                </tr>
                <tr className="bg-blue-50 font-bold">
                  <td className="p-2">Total Gastos Generales</td>
                  <td className="p-2"></td>
                  <td className="p-2 text-right">
                    {formatCOP(
                      valorVenta * (porcentajeComision / 100) +
                      valorVenta * (retencionFuentePorc / 100) +
                      valorVenta * (porcentajeNotarialesVendedor / 100) +
                      valorVenta * (honorariosNotarialesPorc / 100) * (1 + ivaSobreHonorarios) +
                      (valorVenta - valorAdquisicion) * (porcentajeGananciaOcasional / 100)
                    )}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="text-xs text-gray-600 italic p-2">
                    * El impuesto de Ganancia Ocasional se calcula sobre la ganancia neta, siendo la diferencia entre el valor de venta y el avalúo catastral (actualmente {formatCOP(valorAdquisicion)}).
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        {/* Tabla 2: Gastos Individuales */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Tabla 2: Gastos Individuales según Mi Participación</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm">
              <thead className="bg-blue-100">
                <tr>
                  <th className="p-2 text-left border border-gray-300">Propietario</th>
                  <th className="p-2 text-right border border-gray-300">Comisión Agente</th>
                  <th className="p-2 text-right border border-gray-300">Ganancia Ocasional*</th>
                  <th className="p-2 text-right border border-gray-300">Retención Fuente</th>
                  <th className="p-2 text-right border border-gray-300">Gastos Notariales</th>
                  <th className="p-2 text-right border border-gray-300">Honorarios Notariales</th>
                  <th className="p-2 text-right border border-gray-300">IVA Honorarios</th>
                  <th className="p-2 text-right border border-gray-300 font-bold">Total Gastos</th>
                </tr>
              </thead>
              <tbody>
                {calculos.gastosPorPropietario.map((prop, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2 border border-gray-300">{prop.nombre} ({prop.porcentaje}%)</td>
                    <td className="p-2 text-right border border-gray-300">{formatCOP(prop.comisionAgente)}</td>
                    <td className="p-2 text-right border border-gray-300">{formatCOP(prop.impuestoGanancia)}</td>
                    <td className="p-2 text-right border border-gray-300">{formatCOP(prop.retencionFuente)}</td>
                    <td className="p-2 text-right border border-gray-300">{formatCOP(prop.gastosNotariales)}</td>
                    <td className="p-2 text-right border border-gray-300">{formatCOP(prop.honorariosNotariales)}</td>
                    <td className="p-2 text-right border border-gray-300">{formatCOP(prop.ivaHonorarios)}</td>
                    <td className="p-2 text-right border border-gray-300 font-bold">{formatCOP(prop.totalGastos)}</td>
                  </tr>
                ))}
                <tr className="bg-blue-50 font-bold">
                  <td className="p-2 border border-gray-300">Total</td>
                  <td className="p-2 text-right border border-gray-300">
                    {formatCOP(calculos.gastosPorPropietario.reduce((sum, p) => sum + p.comisionAgente, 0))}
                  </td>
                  <td className="p-2 text-right border border-gray-300">
                    {formatCOP(calculos.gastosPorPropietario.reduce((sum, p) => sum + p.impuestoGanancia, 0))}
                  </td>
                  <td className="p-2 text-right border border-gray-300">
                    {formatCOP(calculos.gastosPorPropietario.reduce((sum, p) => sum + p.retencionFuente, 0))}
                  </td>
                  <td className="p-2 text-right border border-gray-300">
                    {formatCOP(calculos.gastosPorPropietario.reduce((sum, p) => sum + p.gastosNotariales, 0))}
                  </td>
                  <td className="p-2 text-right border border-gray-300">
                    {formatCOP(calculos.gastosPorPropietario.reduce((sum, p) => sum + p.honorariosNotariales, 0))}
                  </td>
                  <td className="p-2 text-right border border-gray-300">
                    {formatCOP(calculos.gastosPorPropietario.reduce((sum, p) => sum + p.ivaHonorarios, 0))}
                  </td>
                  <td className="p-2 text-right border border-gray-300">
                    {formatCOP(calculos.totales.gastosVendedores)}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="8" className="text-xs text-gray-600 italic p-2">
                    * Recuerden: El impuesto de Ganancia Ocasional se declara en la declaración de renta del próximo año.
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        {/* Tabla 3: Totalización por Grupo Familiar */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Tabla 3: Totalización de Montos Netos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-blue-100">
                <tr>
                  <th className="p-2 text-left border border-gray-300">Grupo</th>
                  <th className="p-2 text-right border border-gray-300">Monto Bruto por Venta</th>
                  <th className="p-2 text-right border border-gray-300">Gastos Totales</th>
                  <th className="p-2 text-right border border-gray-300 font-bold">Monto Neto a Recibir</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 border border-gray-300">Laura</td>
                  <td className="p-2 text-right border border-gray-300">{formatCOP(valorVenta * (56.25 / 100))}</td>
                  <td className="p-2 text-right border border-gray-300">
                    {formatCOP(
                      calculos.gastosPorPropietario.find(p => p.nombre === 'Laura')?.totalGastos || 0
                    )}
                  </td>
                  <td className="p-2 text-right font-bold border border-gray-300">
                    {formatCOP(
                      calculos.montoNetoPorPropietario.find(p => p.nombre === 'Laura')?.montoNeto || 0
                    )}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 border border-gray-300">Chava (Isabel, Patricia, Ruth y Mauricio)</td>
                  <td className="p-2 text-right border border-gray-300">
                    {formatCOP(
                      valorVenta * ((25 + 6.25 + 6.25 + 6.25) / 100)
                    )}
                  </td>
                  <td className="p-2 text-right border border-gray-300">
                    {formatCOP(
                      calculos.gastosPorPropietario.filter(p => p.nombre !== 'Laura')
                        .reduce((sum, p) => sum + p.totalGastos, 0)
                    )}
                  </td>
                  <td className="p-2 text-right font-bold border border-gray-300">
                    {formatCOP(
                      calculos.montoNetoPorPropietario.filter(p => p.nombre !== 'Laura')
                        .reduce((sum, p) => sum + p.montoNeto, 0)
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="mt-2 text-sm text-gray-600 italic">
              Nota: Si Isabel no paga el impuesto de Ganancia Ocasional (por no declarar renta y por haber vivido allí siempre), 
              su parte de dicho impuesto se podría sumar al total neto del grupo "Chava".
            </div>
          </div>
        </div>
        
        {/* Resumen de la Transacción */}
        <div className="bg-blue-50 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Resumen de la Transacción</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded shadow">
              <p className="font-medium">Valor de Venta:</p>
              <p className="text-xl font-bold text-blue-700">{formatCOP(valorVenta)}</p>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <p className="font-medium">Avalúo Catastral:</p>
              <p className="text-xl font-bold text-blue-700">{formatCOP(valorAdquisicion)}</p>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <p className="font-medium">Ganancia Sujeta a Impuesto:</p>
              <p className="text-xl font-bold text-blue-700">{formatCOP(calculos.gananciaSujetaImpuesto)}</p>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <p className="font-medium">Total Gastos Vendedores:</p>
              <p className="text-xl font-bold text-blue-700">{formatCOP(calculos.totales.gastosVendedores)}</p>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <p className="font-medium">Total Impuesto Ganancia Ocasional:</p>
              <p className="text-xl font-bold text-blue-700">{formatCOP(calculos.totales.impuestoGananciaTotal)}</p>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <p className="font-medium">Monto Neto Total a Recibir:</p>
              <p className="text-xl font-bold text-blue-800">{formatCOP(calculos.totales.montoNetoTotal)}</p>
            </div>
          </div>
          <div className="mt-4 text-sm bg-yellow-50 p-3 rounded">
            <p className="font-bold">Notas importantes:</p>
            <ul className="list-disc ml-4">
              <li>
                La comisión es un pago único del <strong>3%</strong> (negociable hasta <strong>3.5%</strong>) sobre el valor total de venta, y puede ser obtenida por cualquier familiar o tercero que consiga el comprador.
              </li>
              <li>
                El impuesto de Ganancia Ocasional (calculado al {porcentajeGananciaOcasional}% sobre la ganancia neta) se declara y paga en la declaración de renta del próximo año. La ganancia neta es la diferencia entre el valor de venta y el avalúo catastral ({formatCOP(valorAdquisicion)}).
              </li>
              <li>
                Algunos propietarios, como Isabel, podrían estar exentos o pagar menos este impuesto (por ejemplo, si no declara renta y ha vivido allí siempre).
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Sidebar fijo a la derecha */}
      <aside className="w-full md:w-1/3 lg:w-1/4 p-6 bg-gradient-to-b from-blue-500 to-blue-700 text-white sticky top-0 self-start">
        <h2 className="text-2xl font-bold mb-4">Ajustes y Datos</h2>
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Datos de la Venta</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium">Valor de Venta:</label>
            <input
              type="number"
              className="w-full p-2 rounded border border-blue-300 text-blue-900"
              value={valorVenta}
              onChange={(e) => setValorVenta(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Avalúo Catastral:</label>
            <div className="w-full p-2 rounded bg-blue-100 text-blue-800">
              {formatCOP(valorAdquisicion)}
            </div>
            <p className="text-xs mt-1">📍 Valor catastral actualizado</p>
          </div>
          <div>
            <p className="text-sm">Ganancia Sujeta a Impuesto:</p>
            <p className="text-lg font-bold">{formatCOP(calculos.gananciaSujetaImpuesto)}</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-2">Ajustes de Porcentajes</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium">Comisión Agente ({porcentajeComision}%):</label>
            <input
              type="range"
              min="3"
              max="3.5"
              step="0.1"
              value={porcentajeComision}
              onChange={(e) => setPorcentajeComision(parseFloat(e.target.value))}
              className="w-full h-2 rounded-lg bg-blue-300 accent-blue-800"
            />
            <div className="flex justify-between text-xs mt-1">
              <span>3%</span>
              <span>3.5%</span>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Impuesto de Ganancia Ocasional ({porcentajeGananciaOcasional}%):</label>
            <input
              type="range"
              min="10"
              max="30"
              step="1"
              value={porcentajeGananciaOcasional}
              onChange={(e) => setPorcentajeGananciaOcasional(parseFloat(e.target.value))}
              className="w-full h-2 rounded-lg bg-blue-300 accent-blue-800"
            />
            <div className="flex justify-between text-xs mt-1">
              <span>10%</span>
              <span>30%</span>
            </div>
          </div>
          <p className="text-xs italic">* Los ajustes se actualizan automáticamente en las tablas.</p>
        </div>
      </aside>
    </div>
  );
};

export default VentaPropiedadCalculadora;
