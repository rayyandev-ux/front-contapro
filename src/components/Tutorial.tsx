'use client';

import { useEffect, useRef } from 'react';
import { driver, DriveStep } from 'driver.js';
import "driver.js/dist/driver.css";
import { apiJson } from '@/lib/api';

type Props = {
  onComplete: () => void;
};

export default function Tutorial({ onComplete }: Props) {
  const driverRef = useRef<any>(null);
  const runOnce = useRef(false);

  useEffect(() => {
    if (runOnce.current) return;
    runOnce.current = true;

    const finishTour = async () => {
      try {
        await apiJson('/api/auth/preferences', {
          method: 'PATCH',
          body: JSON.stringify({ tutorialSeen: true }),
        });
      } catch (e) {
        console.error('Failed to update tutorial status', e);
      }
      onComplete();
    };

    const isMobile = window.innerWidth < 768;

    const steps: DriveStep[] = isMobile ? [
      {
        popover: {
          title: '👋 Bienvenido a ContaPRO',
          description: 'Tu asistente contable inteligente. Vamos a dar un breve recorrido para mostrarte cómo sacar el máximo provecho de la plataforma.',
          side: "center",
          align: 'center',
        }
      },
      {
        element: '#mobile-nav-dashboard',
        popover: {
          title: '📊 Panel de Control',
          description: 'Resumen visual de tus finanzas en tiempo real.',
          side: "top",
          align: 'center',
        }
      },
      {
        element: '#mobile-nav-upload',
        popover: {
          title: '📤 Sube tus Documentos',
          description: 'Carga facturas y boletas desde aquí.',
          side: "top",
          align: 'center',
        }
      },
      {
        element: '#mobile-nav-expenses',
        popover: {
          title: '💸 Gestión de Gastos',
          description: 'Revisa y categoriza tus transacciones.',
          side: "top",
          align: 'center',
        }
      },
      {
        element: '#mobile-nav-budget',
        popover: {
          title: '💰 Presupuestos',
          description: 'Controla tus finanzas. Aquí puedes acceder a tus presupuestos por Mes, Categoría y Método de Pago.',
          side: "top",
          align: 'center',
        },
        onHighlightStarted: (element: Element) => {
          if (!element) return;
          const mobileMenu = document.querySelector('.fixed.bottom-20');
          if (!mobileMenu) {
            (element as HTMLElement).click();
          }
        }
      },
      {
        element: '#mobile-menu-btn',
        popover: {
          title: '🍔 Más Opciones',
          description: 'Encuentra aquí Métodos de Pago, Integraciones, tu Cuenta y más.',
          side: "bottom",
          align: 'start',
        }
      },
      {
        popover: {
          title: '🚀 ¡Todo listo!',
          description: '¡Empieza a controlar tus finanzas ahora!',
          side: "center",
          align: 'center',
        }
      }
    ] : [
      {
        popover: {
          title: '👋 Bienvenido a ContaPRO',
          description: 'Tu asistente contable inteligente. Vamos a dar un breve recorrido para mostrarte cómo sacar el máximo provecho de la plataforma.',
          side: "center",
          align: 'center',
        }
      },
      {
        element: '#nav-dashboard',
        popover: {
          title: '📊 Panel de Control',
          description: 'Aquí encontrarás un resumen visual de tus ingresos, gastos y el estado de tu presupuesto en tiempo real.',
          side: "right",
          align: 'start',
        }
      },
      {
        element: '#nav-upload',
        popover: {
          title: '📤 Sube tus Documentos',
          description: 'Carga facturas, boletas y recibos aquí. Nuestra IA extraerá la información automáticamente por ti.',
          side: "right",
          align: 'start',
        }
      },
      {
        element: '#nav-expenses',
        popover: {
          title: '💸 Gestión de Gastos',
          description: 'Revisa y categoriza tus gastos procesados. Puedes ver el detalle de cada transacción y editarlo si es necesario.',
          side: "right",
          align: 'start',
        }
      },
      {
        element: '#nav-payment-methods',
        popover: {
          title: '💳 Métodos de Pago',
          description: 'Administra tus tarjetas y cuentas. Configura fechas de corte y visualiza tus saldos.',
          side: "right",
          align: 'start',
        }
      },
      {
        element: '#nav-budget',
        popover: {
          title: '💰 Presupuestos',
          description: 'Define tus límites. Aquí encontrarás las opciones para gestionar tus presupuestos.',
          side: "right",
          align: 'start',
        },
        onHighlightStarted: (element: Element) => {
          if (!element) return;
          const chevron = element.querySelector('.rotate-180');
          if (!chevron) {
            (element as HTMLElement).click();
          }
        }
      },
      {
        element: '#nav-budget-monthly',
        popover: {
          title: '📅 Presupuesto Mensual',
          description: 'Visualiza y controla tus gastos mes a mes. Establece límites globales para mantener tus finanzas sanas.',
          side: "right",
          align: 'start',
        }
      },
      {
        element: '#nav-budget-category',
        popover: {
          title: '🏷️ Presupuesto por Categoría',
          description: 'Asigna montos específicos a cada categoría (ej. Comida, Transporte) para un control más detallado.',
          side: "right",
          align: 'start',
        }
      },
      {
        element: '#nav-budget-payment',
        popover: {
          title: '💳 Presupuesto por Método de Pago',
          description: 'Controla el gasto en tus tarjetas y cuentas bancarias individualmente.',
          side: "right",
          align: 'start',
        }
      },
      {
        element: '#nav-integrations',
        popover: {
          title: '🧩 Integraciones',
          description: 'Conecta ContaPRO con tus aplicaciones de mensajería favoritas.',
          side: "right",
          align: 'start',
        },
        onHighlightStarted: (element: Element) => {
          if (!element) return;
          const chevron = element.querySelector('.rotate-180');
          if (!chevron) {
            (element as HTMLElement).click();
          }
        }
      },
      {
        element: '#nav-integrations-whatsapp',
        popover: {
          title: '📱 WhatsApp',
          description: 'Envía tus comprobantes y gastos directamente a nuestro bot de WhatsApp para que se registren automáticamente.',
          side: "right",
          align: 'start',
        }
      },
      {
        element: '#nav-integrations-telegram',
        popover: {
          title: '✈️ Telegram',
          description: 'Usa nuestro bot de Telegram para registrar gastos de forma rápida y segura desde cualquier lugar.',
          side: "right",
          align: 'start',
        }
      },
      {
        element: '#sidebar-account-section',
        popover: {
          title: '👤 Tu Cuenta',
          description: 'Aquí puedes configurar tus preferencias, cambiar tu plan o cerrar sesión.',
          side: "right",
          align: 'end',
        }
      },
      {
        popover: {
          title: '🚀 ¡Todo listo!',
          description: 'Ya estás listo para empezar a controlar tus finanzas. ¡Disfruta ContaPRO!',
          side: "center",
          align: 'center',
        }
      }
    ];

    driverRef.current = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      stagePadding: 4,
      doneBtnText: '¡Empezar!',
      nextBtnText: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
      prevBtnText: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
      progressText: '{{current}} de {{total}}',
      popoverClass: 'driver-theme-contapro',
      steps: steps,
      onDestroyed: () => {
        // Se llama cuando el usuario cierra el tour o termina
        finishTour();
      },
    });

    // Pequeño delay para asegurar que el DOM está listo y visible
    setTimeout(() => {
      driverRef.current?.drive();
    }, 100);

    return () => {
      // Cleanup si el componente se desmonta
      if (driverRef.current) {
        driverRef.current.destroy();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <style jsx global>{`
      .driver-theme-contapro {
        background-color: var(--popover) !important;
        color: var(--popover-foreground) !important;
        border-radius: var(--radius) !important;
        border: 1px solid var(--border) !important;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        padding: 1.5rem !important;
        max-width: 400px !important;
      }
      
      @media (max-width: 768px) {
        .driver-theme-contapro {
          max-width: 300px !important;
          padding: 1rem !important;
        }
        .driver-theme-contapro .driver-popover-title {
          font-size: 1.1rem !important;
        }
        .driver-theme-contapro .driver-popover-description {
          font-size: 0.9rem !important;
          margin-bottom: 1rem !important;
        }
      }
      
      .driver-theme-contapro .driver-popover-title {
        font-size: 1.25rem !important;
        font-weight: 600 !important;
        line-height: 1.5 !important;
        margin-bottom: 0.5rem !important;
        color: var(--foreground) !important;
      }
      
      .driver-theme-contapro .driver-popover-description {
        color: var(--muted-foreground) !important;
        font-size: 0.95rem !important;
        line-height: 1.5 !important;
        margin-bottom: 1.5rem !important;
      }
      
      .driver-theme-contapro .driver-popover-footer {
        display: flex !important;
        align-items: center !important;
        margin-top: 0 !important;
      }

      .driver-theme-contapro .driver-popover-progress-text {
        color: var(--muted-foreground) !important;
        font-size: 0.875rem !important;
      }

      .driver-theme-contapro .driver-popover-navigation-btns {
        display: flex !important;
        gap: 0.5rem !important;
      }

      .driver-theme-contapro .driver-popover-next-btn,
      .driver-theme-contapro .driver-popover-prev-btn {
        background-color: var(--card) !important;
        color: var(--foreground) !important;
        border: 1px solid var(--border) !important;
        border-radius: 9999px !important;
        width: 2.5rem !important;
        height: 2.5rem !important;
        padding: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-width: 0 !important;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
        transition: all 0.2s !important;
        text-shadow: none !important;
        font-size: 0 !important;
      }

      .driver-theme-contapro .driver-popover-next-btn:hover,
      .driver-theme-contapro .driver-popover-prev-btn:hover {
        background-color: var(--muted) !important;
        color: var(--foreground) !important;
      }
      
      .driver-theme-contapro .driver-popover-next-btn svg,
      .driver-theme-contapro .driver-popover-prev-btn svg {
        display: block !important;
        width: 1.25rem !important;
        height: 1.25rem !important;
      }
      
      .driver-theme-contapro .driver-popover-close-btn {
        color: var(--muted-foreground) !important;
        transition: color 0.2s !important;
      }
      
      .driver-theme-contapro .driver-popover-close-btn:hover {
        color: var(--foreground) !important;
      }
    `}</style>
  );
}
