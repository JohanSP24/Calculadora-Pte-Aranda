import React, { useState, useEffect, useMemo } from 'react';

const VentaPropiedadCalculadora = () => {
  // Valor de venta y valor catastral (avalúo) actualizado
  const [valorVenta, setValorVenta] = useState(440000000);
  const valorAdquisicion = 362514000; // Avalúo Catastral actualizado (2024)

  // Definición de propietarios con sus porcentajes
  // En este caso: "Laura" es un grupo separado y "Chava" agrupa a Isabel, Patricia, Ruth y Mauricio.
  // Inicialmente, usamos los porcentajes: Isabel 25%, Laura 56.25%, Patricia 6.25%, Ruth 6.25%, Mauricio 6.25%.
  const propietarios = useMemo(() => [
    { nombre: 'Isabel', porcentaje: 25 },
    { nombre: 'Laura', porcentaje: 56.25 },
    { nombre: 'Patricia', porcentaje: 6.25 },
    { nombre: 'Ruth', porcentaje: 6.25 },
    { nombre: 'Mauricio', porcentaje: 6.25 }
  ], []);

  // Parámetros de la venta
  const [porcentajeComision, setPorcentajeComision] = useState(3); // Comisión base, negociable hasta 3.5%
  // Actualizamos el porcentaje de impuesto de ganancia ocasional a 12.5%
  const [porcentajeGananciaOcasional, setPorcentajeGananciaOcasional] = useState(12.5);

  // Constantes fijas de otros porcentajes
  const retencionFuentePorc = 1;      // 1%
  const gastosNotarialesPorc = 0.54;   // 0.54% total, se asume 50% para vendedor
  const porcentajeNotarialesVendedor = gastosNotarialesPorc / 2; // 0.27%
  const honorariosNotarialesPorc = 0.5; // 0.5%
  const ivaSobreHonorarios = 0.19;     // 19% IVA sobre honorarios

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
    // Cálculo de ganancia sujeta al impuesto: diferencia entre venta y valor catastral
    const gananciaSujetaImpuesto = valorVenta - valorAdquisicion;

    // Cálculo de cada gasto general (para vendedores) basado en el valor de venta:
    const comisionAgente = valorVenta * (porcentajeComision / 100);
    const impuestoGanancia = gananciaSujetaImpuesto * (porcentajeGananciaOcasional / 100);
    const retencionFuente = valorVenta * (retencionFuentePorc / 100);
    const gastosNotariales = valorVenta * (gastosNotarialesPorc / 100);
    const gastosNotarialesVendedor = gastosNotariales / 2; // se asume 50% de notariales para vendedor
    const honorariosNotariales = valorVenta * (honorariosNotarialesPorc / 100);
    const ivaHonorarios = honorariosNotariales * ivaSobreHonorarios;

    // Calcular gastos individuales para cada propietario (todos los vendedores pagan proporcionalmente)
    const gastosPorPropietario = propietarios.map(prop => {
      const propPorc = prop.porcentaje / 100;
      const comisionProp = comisionAgente * propPorc;
      const impuestoProp = impuestoGanancia * propPorc;
      const retencionProp = retencionFuente * propPorc;
      const notarialesProp = gastosNotarialesVendedor * propPorc;
      const honorariosProp = honorariosNotariales * propPorc;
      const ivaProp = ivaHonorarios * propPorc;
      // Total de gastos para el vendedor incluye todos estos rubros
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

    // Calcular el monto neto por propietario
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

  // Formateo para moneda COP
  const formatCOP = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  // Suma de porcentajes para verificación (debe ser 100%)
  const sumaPorcentajes = propietarios.reduce((suma, prop) => suma + prop.porcentaje, 0);

  // Consolidación de montos netos por grupo:
  // "Laura" es un grupo; "Chava" agrupa a Isabel, Patricia, Ruth y Mauricio.
  const grupoLaura = calculos.montoNetoPorPropietario.find(p => p.nombre === 'Laura') || { montoNeto: 0 };
  const grupoChava = calculos.montoNetoPorPropietario.filter(p => p.nombre !== 'Laura')
    .reduce((total, p) => total + p.montoNeto, 0);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Mi Calculadora de Venta de Propiedad</h1>
      
      {/* Mensaje para la familia */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Mensaje para la Familia</h2>
        <p className="mb-2">
          Hola familia, espero que todos estén muy bien. Quiero contarles que he estado trabajando en la venta de la casa y les comparto toda la información de manera clara.
        </p>
        <p className="mb-2">
          Recuerden que la comisión por vender la casa es del <strong>3%</strong> (negociable hasta <strong>3.5%</strong>). Esto se paga sobre el valor total de venta, y cualquiera, ya sea un familiar o un tercero, que consiga un comprador podrá ganar esta comisión. ¡Así que si alguno de nosotros logra vender la casa, mejor que la comisión quede entre la familia!
        </p>
      </section>
      
      {/* Datos Principales */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Datos de la Venta</h2>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Valor de Venta:</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={valorVenta}
              onChange={(e) => setValorVenta(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Avalúo Catastral (Valor Notarial):</label>
            <div className="w-full p-2 border rounded bg-gray-100 text-gray-700">
              {formatCOP(valorAdquisicion)}
            </div>
            <div className="text-xs text-gray-600 mt-1">📍 Nota: Este es el valor catastral actualizado del inmueble.</div>
          </div>
          <div className="mt-4">
            <p className="font-medium">Ganancia Sujeta a Impuesto:</p>
            <p className="text-lg">{formatCOP(calculos.gananciaSujetaImpuesto)}</p>
          </div>
        </div>
        
        {/* Ajustes de Porcentajes */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Porcentajes de Gastos</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="mb-3">
              <label className="block mb-1 font-medium">
                Comisión Agente ({porcentajeComision}%):
              </label>
              <input
                type="range"
                min="3"
                max="3.5"
                step="0.1"
                value={porcentajeComision}
                onChange={(e) => setPorcentajeComision(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>3%</span>
                <span>3.5%</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                (La comisión es de un único pago sobre el valor total de venta)
              </p>
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium">
                Impuesto de Ganancia Ocasional ({porcentajeGananciaOcasional}%):
              </label>
              <input
                type="range"
                min="10"
                max="30"
                step="1"
                value={porcentajeGananciaOcasional}
                onChange={(e) => setPorcentajeGananciaOcasional(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>10%</span>
                <span>30%</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                (Este porcentaje se aplica sobre la ganancia neta, que es la diferencia entre el valor de venta y el avalúo catastral)
              </p>
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Retención en la Fuente (%):</label>
              <div className="w-full p-2 border rounded bg-gray-100 text-gray-700">
                {retencionFuentePorc}
              </div>
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Gastos Notariales (%):</label>
              <div className="w-full p-2 border rounded bg-gray-100 text-gray-700">
                {gastosNotarialesPorc}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Distribución de Propiedad */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Distribución de Propiedad</h2>
        <div className="mb-2 flex justify-between items-center">
          <span className="font-medium">Total: {sumaPorcentajes.toFixed(2)}%</span>
          <span className={sumaPorcentajes === 100 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
            {sumaPorcentajes === 100 ? "✓ Correcto" : "⚠ La suma debe ser 100%"}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Propietario</th>
                <th className="p-2 text-left">Porcentaje (%)</th>
              </tr>
            </thead>
            <tbody>
              {propietarios.map((prop, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">
                    <div className="w-full p-1 border rounded bg-gray-100 text-gray-700">
                      {prop.nombre}
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="w-full p-1 border rounded bg-gray-100 text-gray-700">
                      {prop.porcentaje}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Tabla 1: Resumen General de Gastos */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Tabla 1: Resumen General de los Gastos en los que Incurrimos</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Concepto</th>
                <th className="p-2 text-right">Porcentaje Aplicado</th>
                <th className="p-2 text-right">Valor Total (COP)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2">Comisión del Agente Inmobiliario</td>
                <td className="p-2 text-right">3%</td>
                <td className="p-2 text-right">{formatCOP(valorVenta * (porcentajeComision / 100))}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Retención en la Fuente</td>
                <td className="p-2 text-right">1%</td>
                <td className="p-2 text-right">{formatCOP(valorVenta * (retencionFuentePorc / 100))}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Gastos Notariales</td>
                <td className="p-2 text-right">0.27%</td>
                <td className="p-2 text-right">{formatCOP(valorVenta * (porcentajeNotarialesVendedor / 100))}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Honorarios Notariales</td>
                <td className="p-2 text-right">0.5%</td>
                <td className="p-2 text-right">{formatCOP(valorVenta * (honorariosNotarialesPorc / 100))}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">IVA sobre Honorarios</td>
                <td className="p-2 text-right">19% sobre honorarios</td>
                <td className="p-2 text-right">{formatCOP(valorVenta * (honorariosNotarialesPorc / 100) * ivaSobreHonorarios)}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Impuesto de Ganancia Ocasional</td>
                <td className="p-2 text-right">12.5% sobre ganancia neta</td>
                <td className="p-2 text-right">
                  {formatCOP((valorVenta - valorAdquisicion) * (porcentajeGananciaOcasional / 100))}
                </td>
              </tr>
              <tr className="bg-gray-100 font-bold">
                <td className="p-2">Total Gastos Generales</td>
                <td className="p-2 text-right"></td>
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
      
      {/* Tabla 2: Gastos por Propietario */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Tabla 2: Gastos Individuales según Mi Participación</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Propietario</th>
                <th className="p-2 text-right">Comisión Agente</th>
                <th className="p-2 text-right">Ganancia Ocasional*</th>
                <th className="p-2 text-right">Retención Fuente</th>
                <th className="p-2 text-right">Gastos Notariales</th>
                <th className="p-2 text-right">Honorarios Notariales</th>
                <th className="p-2 text-right">IVA Honorarios</th>
                <th className="p-2 text-right font-bold">Total Gastos</th>
              </tr>
            </thead>
            <tbody>
              {calculos.gastosPorPropietario.map((prop, idx) => (
                <tr key={idx} className="border-b">
                  <td className="p-2">{prop.nombre} ({prop.porcentaje}%)</td>
                  <td className="p-2 text-right">{formatCOP(prop.comisionAgente)}</td>
                  <td className="p-2 text-right">{formatCOP(prop.impuestoGanancia)}</td>
                  <td className="p-2 text-right">{formatCOP(prop.retencionFuente)}</td>
                  <td className="p-2 text-right">{formatCOP(prop.gastosNotariales)}</td>
                  <td className="p-2 text-right">{formatCOP(prop.honorariosNotariales)}</td>
                  <td className="p-2 text-right">{formatCOP(prop.ivaHonorarios)}</td>
                  <td className="p-2 text-right font-bold">{formatCOP(prop.totalGastos)}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="p-2">Total</td>
                <td className="p-2 text-right">
                  {formatCOP(calculos.gastosPorPropietario.reduce((sum, p) => sum + p.comisionAgente, 0))}
                </td>
                <td className="p-2 text-right">
                  {formatCOP(calculos.gastosPorPropietario.reduce((sum, p) => sum + p.impuestoGanancia, 0))}
                </td>
                <td className="p-2 text-right">
                  {formatCOP(calculos.gastosPorPropietario.reduce((sum, p) => sum + p.retencionFuente, 0))}
                </td>
                <td className="p-2 text-right">
                  {formatCOP(calculos.gastosPorPropietario.reduce((sum, p) => sum + p.gastosNotariales, 0))}
                </td>
                <td className="p-2 text-right">
                  {formatCOP(calculos.gastosPorPropietario.reduce((sum, p) => sum + p.honorariosNotariales, 0))}
                </td>
                <td className="p-2 text-right">
                  {formatCOP(calculos.gastosPorPropietario.reduce((sum, p) => sum + p.ivaHonorarios, 0))}
                </td>
                <td className="p-2 text-right">
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
        <h2 className="text-xl font-semibold mb-4">Tabla 3: Totalización de Montos Netos</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Grupo</th>
                <th className="p-2 text-right">Monto Bruto por Venta</th>
                <th className="p-2 text-right">Gastos Totales</th>
                <th className="p-2 text-right font-bold">Monto Neto a Recibir</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2">Laura</td>
                <td className="p-2 text-right">{formatCOP(valorVenta * (56.25 / 100))}</td>
                <td className="p-2 text-right">
                  {formatCOP(
                    calculos.gastosPorPropietario.find(p => p.nombre === 'Laura')?.totalGastos || 0
                  )}
                </td>
                <td className="p-2 text-right font-bold">
                  {formatCOP(
                    calculos.montoNetoPorPropietario.find(p => p.nombre === 'Laura')?.montoNeto || 0
                  )}
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Chava (Isabel, Patricia, Ruth y Mauricio)</td>
                <td className="p-2 text-right">
                  {formatCOP(
                    valorVenta * ((25 + 6.25 + 6.25 + 6.25) / 100)
                  )}
                </td>
                <td className="p-2 text-right">
                  {formatCOP(
                    calculos.gastosPorPropietario.filter(p => p.nombre !== 'Laura')
                      .reduce((sum, p) => sum + p.totalGastos, 0)
                  )}
                </td>
                <td className="p-2 text-right font-bold">
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
      
      {/* Resumen Final de la Transacción */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Resumen de la Transacción</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-medium">Valor de Venta:</p>
            <p className="text-lg">{formatCOP(valorVenta)}</p>
          </div>
          <div>
            <p className="font-medium">Avalúo Catastral:</p>
            <p className="text-lg">{formatCOP(valorAdquisicion)}</p>
          </div>
          <div>
            <p className="font-medium">Ganancia Sujeta a Impuesto:</p>
            <p className="text-lg">{formatCOP(calculos.gananciaSujetaImpuesto)}</p>
          </div>
          <div>
            <p className="font-medium">Total Gastos Vendedores:</p>
            <p className="text-lg">{formatCOP(calculos.totales.gastosVendedores)}</p>
          </div>
          <div>
            <p className="font-medium">Total Impuesto Ganancia Ocasional:</p>
            <p className="text-lg">{formatCOP(calculos.totales.impuestoGananciaTotal)}</p>
          </div>
          <div>
            <p className="font-medium">Monto Neto Total a Recibir:</p>
            <p className="text-lg font-bold">{formatCOP(calculos.totales.montoNetoTotal)}</p>
          </div>
        </div>
        <div className="mt-4 text-sm bg-yellow-50 p-3 rounded">
          <p className="font-bold">Notas importantes:</p>
          <ul className="list-disc ml-4">
            <li>
              La comisión es un pago único del 3% (negociable hasta 3.5%) sobre el valor total de venta, y puede ser
              obtenida por cualquier familiar o tercero que consiga el comprador.
            </li>
            <li>
              El impuesto de Ganancia Ocasional (calculado al {porcentajeGananciaOcasional}% sobre la ganancia neta) 
              se declara y paga en la declaración de renta del próximo año. La ganancia neta es la diferencia entre el valor de venta y el avalúo catastral ({formatCOP(valorAdquisicion)}).
            </li>
            <li>
              Algunos propietarios, como Isabel, podrían estar exentos o pagar menos este impuesto (por ejemplo, si no declara renta y ha vivido allí siempre).
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VentaPropiedadCalculadora;
