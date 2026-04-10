<?php

namespace App\Services;

use App\Models\Espacio;
use App\Models\RangoHorario;

class DisponibilidadService
{
    /**
     * Retorna los rangos horarios de un espacio para una fecha dada,
     * marcando cada uno con si está disponible (sin reserva confirmada/pendiente).
     *
     * @param  Espacio  $espacio
     * @param  string   $fecha  formato Y-m-d
     * @return \Illuminate\Support\Collection<int, RangoHorario>  con atributo virtual ->disponible
     */
    public function horariosDisponibles(Espacio $espacio, string $fecha): \Illuminate\Support\Collection
    {
        // Día de la semana como tinyint (1=Lunes … 7=Domingo), igual a la columna dia_semana
        $diaSemana = (int) date('N', strtotime($fecha));

        // IDs de rangos ya reservados ese día (estado confirmado o pendiente)
        $rangosTomados = $espacio->reservas()
            ->whereDate('fecha_reserva', $fecha)
            ->whereIn('estado', ['confirmada', 'finalizada'])
            ->pluck('rango_horario_id');

        return $espacio->rangosHorarios()
            ->where('dia_semana', $diaSemana)
            ->where('disponible', true)
            ->orderBy('hora_inicio')
            ->get()
            ->map(function (RangoHorario $rango) use ($rangosTomados) {
                // Agrega atributo virtual: true si el rango no está tomado
                $rango->disponible = !$rangosTomados->contains($rango->id);
                return $rango;
            });
    }

    /**
     * Verifica si un rango específico está libre para una fecha.
     */
    public function estaDisponible(int $rangoHorarioId, string $fecha): bool
    {
        return !\App\Models\Reserva::where('rango_horario_id', $rangoHorarioId)
            ->whereDate('fecha_reserva', $fecha)
            ->whereIn('estado', ['confirmada', 'finalizada'])
            ->exists();
    }
}
