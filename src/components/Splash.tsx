import Image from 'next/image';

interface SplashProps {
    isFadingOut: boolean;
}

// La palabra clave "export default" convierte este archivo en un módulo.
export default function Splash({isFadingOut}: SplashProps) {
    return (
        <div 
            className={`
            flex flex-col justify-center items-center h-screen bg-purple-700 text-white text-center
            transition-opacity duration-500 ease-in-out
            ${isFadingOut ? 'opacity-0' : 'opacity-100'}
            `}
        >
        <Image
            src="/logo/taskly-logo.png"
            alt="Tasky Logo"
            width={100}
            height={100}
            className="animate-pulse"
        />
        <h1 className="text-4xl font-bold mt-4">Tasky</h1>
        <p className="mt-2">Cargando tus tareas...</p>
        </div>
    );
}
