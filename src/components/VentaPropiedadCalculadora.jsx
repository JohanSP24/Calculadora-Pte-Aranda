import React, { useState, useEffect, useMemo } from 'react';

const VentaPropiedadCalculadora = () => {
  const [valorVenta, setValorVenta] = useState(440000000);
  const valorAdquisicion = 362514000; // Avalúo Catastral
  
  // Memoizamos el array de propietarios para que no se re-cree en cada render
  const propietarios = useMemo(() => [
    { nombre: 'Chava', porcentaje: 25 },
    { nombre: 'Laura', porcentaje: 56.25 },
    { nombre: 'Patricia', porcentaje: 6.25 },
    { nombre: 'Ruth', porcentaje: 6.25 },
    { nombre: 'Mauricio', porcentaje: 6.25 }
  ], []);
  
  const [porcentajeComision, setPorcentajeComision] = useState(3);
  const [porcentajeGananciaOcasional, setPorcentajeGananciaOcasional] = useState(10);

  const porcentajes = {
    comisionAgente: porcentajeComision,
    impuestoGananciaOcasional: porcentajeGananciaOcasional,
    retencionFuente: 1,
    gastosNotariales: 0.54
  };

  const [calculos, setCalculos] = useState({
    gananciaSujetaImpuesto: 0,
    gastosPorPropietario: [],
    montoNetoPorPropietario: [],
    totales: {
      gastosVendedores: 0,
      gastosComprador: 0,
      montoNetoTotal: 0,
      impuestoGananciaTotal: 0
    }
  });

  useEffect(() => {
    const gananciaSujetaImpuesto = valorVenta - valorAdquisicion;
    
    // Calcular gastos totales
    const comisionAgente = valorVenta * (porcentajes.comisionAgente / 100);
    const impuestoGanancia = gananciaSujetaImpuesto * (porcentajes.impuestoGananciaOcasional / 100);
    const retencionFuente = valorVenta * (porcentajes.retencionFuente / 100);
    const gastosNotariales = valorVenta * (porcentajes.gastosNotariales / 100);
    const gastosNotarialesVendedor = gastosNotariales / 2;
    
    // Calcular gastos por propietario y montos netos
    const gastosPorPropietario = propietarios.map(propietario => {
      const porcentajeProp = propietario.porcentaje / 100;
      const comisionProp = comisionAgente * porcentajeProp;
      const impuestoProp = impuestoGanancia * porcentajeProp;
      const retencionProp = retencionFuente * porcentajeProp;
      const notarialesProp = gastosNotarialesVendedor * porcentajeProp;
      
      // No se incluye el impuesto de ganancia ocasional en el total de gastos
      const totalGastosProp = comisionProp + retencionProp + notarialesProp;
      
      return {
        nombre: propietario.nombre,
        porcentaje: propietario.porcentaje,
        comisionAgente: comisionProp,
        impuestoGanancia: impuestoProp,
        retencionFuente: retencionProp,
        gastosNotariales: notarialesProp,
        totalGastos: totalGastosProp
      };
    });
    
    const montoNetoPorPropietario = propietarios.map((propietario, index) => {
      const valorBruto = valorVenta * (propietario.porcentaje / 100);
      const totalGastos = gastosPorPropietario[index].totalGastos;
      const impuestoGananciaProp = gastosPorPropietario[index].impuestoGanancia;
      
      return {
        nombre: propietario.nombre,
        valorBruto,
        totalGastos,
        impuestoGanancia: impuestoGananciaProp,
        montoNeto: valorBruto - totalGastos
      };
    });
    
    // Calcular totales
    const totalGastosVendedores = gastosPorPropietario.reduce((total, prop) => total + prop.totalGastos, 0);
    const totalNetoVendedores = montoNetoPorPropietario.reduce((total, prop) => total + prop.montoNeto, 0);
    const totalImpuestoGanancia = gastosPorPropietario.reduce((total, prop) => total + prop.impuestoGanancia, 0);
    
    // Gastos del comprador (impuesto de registro y 50% de gastos notariales)
    const impuestoRegistro = valorVenta * 0.0167;
    const gastosComprador = impuestoRegistro + gastosNotarialesVendedor;
    
    setCalculos({
      gananciaSujetaImpuesto,
      gastosPorPropietario,
      montoNetoPorPropietario,
      totales: {
        gastosVendedores: totalGastosVendedores,
        gastosComprador: gastosComprador,
        montoNetoTotal: totalNetoVendedores,
        impuestoGananciaTotal: totalImpuestoGanancia
      }
    });
  }, [
    valorVenta,
    porcentajeComision,
    porcentajeGananciaOcasional,
    propietarios,
    porcentajes.comisionAgente,
    porcentajes.impuestoGananciaOcasional,
    porcentajes.retencionFuente,
    porcentajes.gastosNotariales
  ]);

  const formatCOP = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  const sumaPorcentajes = propietarios.reduce((suma, prop) => suma + prop.porcentaje, 0);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Calculadora de Venta de Propiedad</h1>
      
      {/* Datos principales */}
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
            <label className="block mb-2 font-medium">Avalúo Catastral:</label>
            <div className="w-full p-2 border rounded bg-gray-100 text-gray-700">
              {formatCOP(valorAdquisicion)}
            </div>
          </div>
          
          <div className="mt-4">
            <p className="font-medium">Ganancia Sujeta a Impuesto:</p>
            <p className="text-lg">{formatCOP(calculos.gananciaSujetaImpuesto)}</p>
          </div>
        </div>
        
        {/* Porcentajes de Gastos */}
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
            </div>
            
            <div className="mb-3">
              <label className="block mb-1 font-medium">
                Ganancia Ocasional ({porcentajeGananciaOcasional}%):
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
            </div>
            
            <div className="mb-3">
              <label className="block mb-1 font-medium">Retención Fuente (%):</label>
              <div className="w-full p-2 border rounded bg-gray-100 text-gray-700">
                {porcentajes.retencionFuente}
              </div>
            </div>
            
            <div className="mb-3">
              <label className="block mb-1 font-medium">Gastos Notariales (%):</label>
              <div className="w-full p-2 border rounded bg-gray-100 text-gray-700">
                {porcentajes.gastosNotariales}
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
              {propietarios.map((propietario, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">
                    <div className="w-full p-1 border rounded bg-gray-100 text-gray-700">
                      {propietario.nombre}
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="w-full p-1 border rounded bg-gray-100 text-gray-700">
                      {propietario.porcentaje}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Gastos por Propietario */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Gastos por Propietario</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Propietario</th>
                <th className="p-2 text-right">Comisión Agente</th>
                <th className="p-2 text-right">Ganancia Ocasional*</th>
                <th className="p-2 text-right">Retención Fuente</th>
                <th className="p-2 text-right">Gastos Notariales</th>
                <th className="p-2 text-right font-bold">Total Gastos</th>
              </tr>
            </thead>
            <tbody>
              {calculos.gastosPorPropietario.map((prop, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{prop.nombre} ({prop.porcentaje}%)</td>
                  <td className="p-2 text-right">{formatCOP(prop.comisionAgente)}</td>
                  <td className="p-2 text-right">{formatCOP(prop.impuestoGanancia)}</td>
                  <td className="p-2 text-right">{formatCOP(prop.retencionFuente)}</td>
                  <td className="p-2 text-right">{formatCOP(prop.gastosNotariales)}</td>
                  <td className="p-2 text-right font-bold">{formatCOP(prop.totalGastos)}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="p-2">Total</td>
                <td className="p-2 text-right">{formatCOP(calculos.gastosPorPropietario.reduce((sum, p) => sum + p.comisionAgente, 0))}</td>
                <td className="p-2 text-right">{formatCOP(calculos.gastosPorPropietario.reduce((sum, p) => sum + p.impuestoGanancia, 0))}</td>
                <td className="p-2 text-right">{formatCOP(calculos.gastosPorPropietario.reduce((sum, p) => sum + p.retencionFuente, 0))}</td>
                <td className="p-2 text-right">{formatCOP(calculos.gastosPorPropietario.reduce((sum, p) => sum + p.gastosNotariales, 0))}</td>
                <td className="p-2 text-right">{formatCOP(calculos.totales.gastosVendedores)}</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-2 text-sm text-gray-600 italic">
            * El impuesto de Ganancia Ocasional no está incluido en el Total Gastos y deberá ser pagado individualmente en la declaración de renta.
          </div>
        </div>
      </div>
      
      {/* Montos Netos a Recibir */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Montos Netos a Recibir</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Propietario</th>
                <th className="p-2 text-right">Valor Bruto</th>
                <th className="p-2 text-right">Gastos Directos</th>
                <th className="p-2 text-right">Ganancia Ocasional*</th>
                <th className="p-2 text-right font-bold">Monto Neto</th>
              </tr>
            </thead>
            <tbody>
              {calculos.montoNetoPorPropietario.map((prop, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{prop.nombre}</td>
                  <td className="p-2 text-right">{formatCOP(prop.valorBruto)}</td>
                  <td className="p-2 text-right">{formatCOP(prop.totalGastos)}</td>
                  <td className="p-2 text-right">{formatCOP(prop.impuestoGanancia)}</td>
                  <td className="p-2 text-right font-bold">{formatCOP(prop.montoNeto)}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="p-2">Total</td>
                <td className="p-2 text-right">{formatCOP(valorVenta)}</td>
                <td className="p-2 text-right">{formatCOP(calculos.totales.gastosVendedores)}</td>
                <td className="p-2 text-right">{formatCOP(calculos.totales.impuestoGananciaTotal)}</td>
                <td className="p-2 text-right">{formatCOP(calculos.totales.montoNetoTotal)}</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-2 text-sm text-gray-600 italic">
            * El impuesto de Ganancia Ocasional deberá cancelarse de manera individual en la declaración de renta según las particularidades fiscales de cada propietario.
          </div>
        </div>
      </div>
      
      {/* Resumen de la Transacción */}
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
            <p className="font-medium">Total Gastos Comprador:</p>
            <p className="text-lg">{formatCOP(calculos.totales.gastosComprador)}</p>
          </div>
          <div>
            <p className="font-medium">Monto Neto Total a Recibir:</p>
            <p className="text-lg font-bold">{formatCOP(calculos.totales.montoNetoTotal)}</p>
          </div>
        </div>
        <div className="mt-4 text-sm bg-yellow-50 p-3 rounded">
          <p className="font-bold">Notas importantes:</p>
          <p>1. Se podría optimizar el pago del impuesto de ganancia ocasional si Chava aplica la exención de vivienda familiar.</p>
          <p>2. El impuesto de ganancia ocasional deberá ser declarado y pagado individualmente por cada propietario según sus circunstancias fiscales particulares.</p>
        </div>
      </div>
    </div>
  );
};

export default VentaPropiedadCalculadora;
