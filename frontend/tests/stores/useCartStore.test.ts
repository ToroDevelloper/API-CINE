import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore, useCartTotals } from '../../app/stores/useCartStore';
import { renderHook } from '@testing-library/react';

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('sets funcion correctly', () => {
    const info = {
      peliculaTitulo: 'Test',
      salaNombre: 'Sala 1',
      fechaHora: '2026-06-09T20:00:00Z',
      precioBase: 10,
      formato: '2D'
    };
    useCartStore.getState().setFuncion('f1', info);
    expect(useCartStore.getState().funcionId).toBe('f1');
    expect(useCartStore.getState().funcionInfo).toEqual(info);
  });

  it('manages asientos correctly', () => {
    const asiento1 = { _id: 'a1', fila: 'A', numero: 1, tipo: 'normal', estado: 'disponible', precio: 10 } as any;
    const asiento2 = { _id: 'a2', fila: 'A', numero: 2, tipo: 'normal', estado: 'disponible', precio: 10 } as any;

    useCartStore.getState().addAsiento(asiento1);
    expect(useCartStore.getState().asientos).toHaveLength(1);
    
    // Add same asiento
    useCartStore.getState().addAsiento(asiento1);
    expect(useCartStore.getState().asientos).toHaveLength(1);

    useCartStore.getState().addAsiento(asiento2);
    expect(useCartStore.getState().asientos).toHaveLength(2);

    expect(useCartStore.getState().hasAsiento('a1')).toBe(true);

    useCartStore.getState().removeAsiento('a1');
    expect(useCartStore.getState().asientos).toHaveLength(1);

    useCartStore.getState().toggleAsiento(asiento2);
    expect(useCartStore.getState().asientos).toHaveLength(0);

    useCartStore.getState().toggleAsiento(asiento1);
    expect(useCartStore.getState().asientos).toHaveLength(1);

    useCartStore.getState().clearAsientos();
    expect(useCartStore.getState().asientos).toHaveLength(0);
  });

  it('manages snacks correctly', () => {
    const snack1 = { _id: 's1', nombre: 'Popcorn', precio: 5 } as any;
    const snack2 = { _id: 's2', nombre: 'Soda', precio: 3 } as any;

    useCartStore.getState().addSnack(snack1);
    expect(useCartStore.getState().snacks).toHaveLength(1);
    expect(useCartStore.getState().snacks[0].cantidad).toBe(1);

    useCartStore.getState().addSnack(snack1);
    expect(useCartStore.getState().snacks[0].cantidad).toBe(2);

    useCartStore.getState().addSnack(snack2);
    expect(useCartStore.getState().snacks).toHaveLength(2);

    useCartStore.getState().updateSnackCantidad('s1', 5);
    expect(useCartStore.getState().snacks[0].cantidad).toBe(5);

    useCartStore.getState().updateSnackCantidad('s1', 0);
    expect(useCartStore.getState().snacks.find(s => s.snack._id === 's1')).toBeUndefined();

    useCartStore.getState().clearSnacks();
    const stateAfterRemove = useCartStore.getState();
    expect(stateAfterRemove.snacks).toHaveLength(0);
  });

  it('updateSnackCantidad updates correctly', () => {
    const mockSnack = { _id: 's1', nombre: 'Popcorn', precio: 5 } as any;
    useCartStore.getState().addSnack(mockSnack, 1);
    useCartStore.getState().updateSnackCantidad('s1', 5);
    const state = useCartStore.getState();
    expect(state.snacks[0].cantidad).toBe(5);

    // update to 0 removes it
    useCartStore.getState().updateSnackCantidad('s1', 0);
    expect(useCartStore.getState().snacks).toHaveLength(0);
  });

  it('clearCart empties everything', () => {
    const mockAsiento = { _id: 'a1', fila: 'A', numero: 1, tipo: 'normal', estado: 'disponible', precio: 10 } as any;
    const mockSnack = { _id: 's1', nombre: 'Popcorn', precio: 5 } as any;
    useCartStore.getState().addAsiento(mockAsiento);
    useCartStore.getState().addSnack(mockSnack, 1);
    
    useCartStore.getState().clearCart();
    const state = useCartStore.getState();
    expect(state.asientos).toHaveLength(0);
    expect(state.snacks).toHaveLength(0);
  });

  it('calculates totals correctly (getters)', () => {
    const asiento = { _id: 'a1', fila: 'A', numero: 1, tipo: 'normal', estado: 'disponible', precio: 10 } as any;
    const snack = { _id: 's1', nombre: 'Popcorn', precio: 5 } as any;

    useCartStore.getState().addAsiento(asiento);
    useCartStore.getState().addSnack(snack);
    useCartStore.getState().addSnack(snack); // qty 2

    expect(useCartStore.getState().asientos.length).toBe(1);
    expect(useCartStore.getState().snacks.reduce((a, b) => a + b.cantidad, 0)).toBe(2);
  });

  it('useCartTotals hook', () => {
    const asiento = { _id: 'a1', fila: 'A', numero: 1, tipo: 'normal', estado: 'disponible', precio: 10 } as any;
    const snack = { _id: 's1', nombre: 'Popcorn', precio: 5 } as any;

    useCartStore.getState().addAsiento(asiento);
    useCartStore.getState().addSnack(snack);

    const { result } = renderHook(() => useCartTotals());
    expect(result.current.subtotalAsientos).toBe(10);
    expect(result.current.subtotalSnacks).toBe(5);
    expect(result.current.total).toBe(15);
    expect(result.current.itemCount).toBe(2);
  });

  it('useCartTotals hook returns zero values when cart is empty', () => {
    const { result } = renderHook(() => useCartTotals());
    expect(result.current.subtotalAsientos).toBe(0);
    expect(result.current.subtotalSnacks).toBe(0);
    expect(result.current.total).toBe(0);
    expect(result.current.itemCount).toBe(0);
  });
});
