import { useEffect, useRef } from 'react'
import Particles from 'react-tsparticles'
import { loadSlim } from 'tsparticles-slim'

export default function ParticlesBackground() {
  const particlesInit = async (engine) => {
    await loadSlim(engine)
  }

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        background: {
          color: '#000000',
        },
        fullScreen: {
          enable: true,
          zIndex: -1,
        },
        particles: {
          number: {
            value: 80,
            density: {
              enable: true,
              value_area: 800,
            },
          },
          color: {
            value: '#ffffff',
          },
          shape: {
            type: 'circle',
          },
          opacity: {
            value: {
              min: 0.1,
              max: 0.5,
            },
            animation: {
              enable: true,
              speed: 0.5,
              sync: false,
            },
          },
          size: {
            value: {
              min: 0.5,
              max: 2,
            },
          },
          move: {
            enable: true,
            speed: {
              min: 0.1,
              max: 0.5,
            },
            direction: 'none',
            random: true,
            straight: false,
            out_mode: 'out',
            bounce: false,
          },
        },
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: 'repulse',
            },
            resize: true,
          },
          modes: {
            repulse: {
              distance: 100,
              duration: 0.4,
            },
          },
        },
        detectRetina: true,
      }}
    />
  )
}
