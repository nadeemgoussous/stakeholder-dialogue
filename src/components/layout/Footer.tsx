/**
 * Footer component with IRENA toolkit reference
 *
 * Features:
 * - Reference to IRENA's Participatory Processes toolkit
 * - Version information
 * - Offline-first indicator
 * - Dark gray background for contrast
 */
export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-16 py-8" role="contentinfo">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          Part of IRENA's <strong>Participatory Processes for Strategic Energy Planning</strong> toolkit
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Version 1.0.0 • Offline-First Design
        </p>
      </div>
    </footer>
  )
}
