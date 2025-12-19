import React from "react";

function MentionsLegales() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fef5f5] via-white to-[#fef5f5] pt-20 pb-16 px-4 sm:px-6 lg:px-12 mt-10">
      <div className="max-w-4xl mx-auto">
        <div className="relative mb-12">
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <h1 className="text-9xl font-black text-[#f0cfcf]">MENTIONS</h1>
          </div>
          <div className="relative z-10">
            <h1 className="text-5xl sm:text-6xl font-black text-[#8b6f6f] mb-6 leading-tight">
              Mentions légales
            </h1>
            <div className="w-24 h-1.5 bg-gradient-to-r from-[#f0cfcf] to-[#e0bfbf] mb-8 rounded-full"></div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 space-y-8 border border-gray-100">
          <section>
            <h2 className="text-2xl font-bold text-[#8b6f6f] mb-4">
              1. Informations légales
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                <strong className="text-[#8b6f6f]">Raison sociale :</strong> Le
                cocon de Laura
              </p>
              <p>
                <strong className="text-[#8b6f6f]">Propriétaire :</strong> Laura
                Coutant
              </p>
              <p>
                <strong className="text-[#8b6f6f]">Adresse :</strong> 70 rue
                Sadi Carnot, 17500 Jonzac, France
              </p>
              <p>
                <strong className="text-[#8b6f6f]">Téléphone :</strong>{" "}
                <a
                  href="tel:0787984341"
                  className="text-[#8b6f6f] hover:underline"
                >
                  07 87 98 43 41
                </a>
              </p>
              <p>
                <strong className="text-[#8b6f6f]">Email :</strong>{" "}
                <a
                  href="mailto:lecocondelaura17@gmail.com"
                  className="text-[#8b6f6f] hover:underline"
                >
                  lecocondelaura17@gmail.com
                </a>
              </p>
              <p>
                <strong className="text-[#8b6f6f]">SIRET :</strong> [À
                compléter]
              </p>
              <p>
                <strong className="text-[#8b6f6f]">Activité :</strong> Salon de
                Head Spa et bien-être
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#8b6f6f] mb-4">
              2. Directeur de publication
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Le directeur de la publication est Laura Coutant, propriétaire du
              salon Le cocon de Laura.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#8b6f6f] mb-4">
              3. Hébergement du site
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Ce site est hébergé par :
            </p>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong className="text-[#8b6f6f]">Hébergeur :</strong> [Nom de
                l'hébergeur - À compléter]
              </p>
              <p>
                <strong className="text-[#8b6f6f]">Adresse :</strong> [Adresse
                de l'hébergeur - À compléter]
              </p>
              <p>
                <strong className="text-[#8b6f6f]">Téléphone :</strong>{" "}
                [Téléphone de l'hébergeur - À compléter]
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#8b6f6f] mb-4">
              4. Propriété intellectuelle
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              L'ensemble de ce site relève de la législation française et
              internationale sur le droit d'auteur et la propriété
              intellectuelle. Tous les droits de reproduction sont réservés, y
              compris pour les documents téléchargeables et les représentations
              iconographiques et photographiques.
            </p>
            <p className="text-gray-700 leading-relaxed">
              La reproduction de tout ou partie de ce site sur un support
              électronique ou autre est formellement interdite sauf autorisation
              expresse du directeur de la publication.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#8b6f6f] mb-4">
              5. Responsabilité
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Les informations contenues sur ce site sont aussi précises que
              possible et le site est mis à jour à différentes périodes de
              l'année, mais peut toutefois contenir des inexactitudes, des
              omissions ou des lacunes.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Le cocon de Laura ne pourra être tenu responsable des dommages
              directs et indirects causés au matériel de l'utilisateur, lors de
              l'accès au site, et résultant soit de l'utilisation d'un matériel
              ne répondant pas aux spécifications, soit de l'apparition d'un bug
              ou d'une incompatibilité.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#8b6f6f] mb-4">
              6. Liens hypertextes
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Le site peut contenir des liens hypertextes vers d'autres sites
              présents sur le réseau Internet. Les liens vers ces autres
              ressources vous font quitter le site Le cocon de Laura. Il est
              possible de créer un lien vers la page de présentation de ce site
              sans autorisation expresse de l'éditeur. Aucune autorisation ni
              demande d'information préalable ne peut être exigée par l'éditeur
              à l'égard d'un site qui souhaite établir un lien vers le site de
              l'éditeur. Il convient toutefois d'afficher ce site dans une
              nouvelle fenêtre du navigateur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#8b6f6f] mb-4">
              7. Droit applicable
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Les présentes mentions légales sont régies par le droit français.
              En cas de litige et à défaut d'accord amiable, le litige sera
              porté devant les tribunaux français conformément aux règles de
              compétence en vigueur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#8b6f6f] mb-4">
              8. Contact
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Pour toute question concernant les présentes mentions légales,
              vous pouvez nous contacter à l'adresse suivante :{" "}
              <a
                href="mailto:lecocondelaura17@gmail.com"
                className="text-[#8b6f6f] hover:underline font-semibold"
              >
                lecocondelaura17@gmail.com
              </a>
            </p>
          </section>

          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 italic">
              Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MentionsLegales;
