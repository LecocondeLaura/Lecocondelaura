import React from "react";

function PolitiqueConfidentialite() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fef5f5] via-white to-[#fef5f5] pt-20 pb-16 px-4 sm:px-6 lg:px-12 mt-10">
      <div className="max-w-4xl mx-auto">
        <div className="relative mb-12">
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <h1 className="text-9xl font-black text-[#f0cfcf]">
              CONFIDENTIALITÉ
            </h1>
          </div>
          <div className="relative z-10">
            <h1 className="text-5xl sm:text-6xl font-black text-[#8b6f6f] mb-6 leading-tight">
              Politique de confidentialité
            </h1>
            <div className="w-24 h-1.5 bg-gradient-to-r from-[#f0cfcf] to-[#e0bfbf] mb-8 rounded-full"></div>
            <p className="text-lg text-gray-600 leading-relaxed">
              Le cocon de Laura s'engage à protéger vos données personnelles et
              à respecter votre vie privée. Cette politique explique comment
              nous collectons, utilisons et protégeons vos informations.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 space-y-8 border border-gray-100">
          <section>
            <h2 className="text-2xl font-bold text-[#8b6f6f] mb-4">
              1. Responsable du traitement
            </h2>
            <div className="space-y-2 text-gray-700 leading-relaxed">
              <p>Le responsable du traitement des données personnelles est :</p>
              <div className="bg-[#fcebeb] rounded-xl p-4 mt-3">
                <p>
                  <strong className="text-[#8b6f6f]">Le cocon de Laura</strong>
                </p>
                <p>Laura Coutant</p>
                <p>70 rue Sadi Carnot, 17500 Jonzac, France</p>
                <p>
                  Email :{" "}
                  <a
                    href="mailto:lecocondelaura17@gmail.com"
                    className="text-[#8b6f6f] hover:underline"
                  >
                    lecocondelaura17@gmail.com
                  </a>
                </p>
                <p>
                  Téléphone :{" "}
                  <a
                    href="tel:0787984341"
                    className="text-[#8b6f6f] hover:underline"
                  >
                    07 87 98 43 41
                  </a>
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#8b6f6f] mb-4">
              2. Données collectées
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Nous collectons les données personnelles suivantes lorsque vous
              utilisez notre site ou prenez rendez-vous :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>
                <strong className="text-[#8b6f6f]">
                  Données d'identification :
                </strong>{" "}
                nom, prénom
              </li>
              <li>
                <strong className="text-[#8b6f6f]">Données de contact :</strong>{" "}
                adresse email, numéro de téléphone
              </li>
              <li>
                <strong className="text-[#8b6f6f]">
                  Données de réservation :
                </strong>{" "}
                service souhaité, date et heure du rendez-vous, message
                optionnel
              </li>
              <li>
                <strong className="text-[#8b6f6f]">Données techniques :</strong>{" "}
                adresse IP, type de navigateur, pages visitées (via cookies si
                applicable)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#8b6f6f] mb-4">
              3. Finalités du traitement
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Vos données personnelles sont collectées et traitées pour les
              finalités suivantes :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Gestion des réservations et prise de rendez-vous</li>
              <li>Confirmation et rappel de vos rendez-vous</li>
              <li>Communication avec vous concernant nos services</li>
              <li>Amélioration de nos services et de votre expérience</li>
              <li>Respect de nos obligations légales et réglementaires</li>
              <li>Gestion de la relation client</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#8b6f6f] mb-4">
              4. Base légale du traitement
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Le traitement de vos données personnelles est fondé sur :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>
                <strong className="text-[#8b6f6f]">Votre consentement :</strong>{" "}
                lorsque vous remplissez le formulaire de réservation
              </li>
              <li>
                <strong className="text-[#8b6f6f]">
                  L'exécution d'un contrat :
                </strong>{" "}
                pour la gestion de votre réservation
              </li>
              <li>
                <strong className="text-[#8b6f6f]">L'intérêt légitime :</strong>{" "}
                pour l'amélioration de nos services
              </li>
              <li>
                <strong className="text-[#8b6f6f]">
                  Les obligations légales :
                </strong>{" "}
                pour la conservation de certaines données
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#8b6f6f] mb-4">
              5. Conservation des données
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Vos données personnelles sont conservées pour les durées suivantes
              :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>
                <strong className="text-[#8b6f6f]">
                  Données de réservation :
                </strong>{" "}
                3 ans à compter de la dernière interaction
              </li>
              <li>
                <strong className="text-[#8b6f6f]">Données de contact :</strong>{" "}
                3 ans à compter de la dernière utilisation
              </li>
              <li>
                <strong className="text-[#8b6f6f]">Données comptables :</strong>{" "}
                10 ans conformément aux obligations légales
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Passé ces délais, vos données seront supprimées ou anonymisées.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#8b6f6f] mb-4">
              6. Destinataires des données
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Vos données personnelles sont destinées à :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Le personnel autorisé du salon Le cocon de Laura</li>
              <li>
                Nos prestataires techniques (hébergeur, service d'emailing) dans
                le cadre de l'exécution de leurs missions
              </li>
              <li>
                Les autorités compétentes si la loi l'exige ou en cas de
                réquisition judiciaire
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Nous ne vendons ni ne louons vos données personnelles à des tiers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#8b6f6f] mb-4">
              7. Vos droits
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Conformément au Règlement Général sur la Protection des Données
              (RGPD), vous disposez des droits suivants :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>
                <strong className="text-[#8b6f6f]">Droit d'accès :</strong> vous
                pouvez obtenir une copie de vos données personnelles
              </li>
              <li>
                <strong className="text-[#8b6f6f]">
                  Droit de rectification :
                </strong>{" "}
                vous pouvez corriger vos données inexactes ou incomplètes
              </li>
              <li>
                <strong className="text-[#8b6f6f]">
                  Droit à l'effacement :
                </strong>{" "}
                vous pouvez demander la suppression de vos données
              </li>
              <li>
                <strong className="text-[#8b6f6f]">
                  Droit à la limitation :
                </strong>{" "}
                vous pouvez demander la limitation du traitement de vos données
              </li>
              <li>
                <strong className="text-[#8b6f6f]">Droit d'opposition :</strong>{" "}
                vous pouvez vous opposer au traitement de vos données
              </li>
              <li>
                <strong className="text-[#8b6f6f]">
                  Droit à la portabilité :
                </strong>{" "}
                vous pouvez récupérer vos données dans un format structuré
              </li>
              <li>
                <strong className="text-[#8b6f6f]">
                  Droit de retirer votre consentement :
                </strong>{" "}
                à tout moment, sans affecter la licéité du traitement effectué
                avant le retrait
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Pour exercer ces droits, vous pouvez nous contacter à l'adresse
              suivante :{" "}
              <a
                href="mailto:lecocondelaura17@gmail.com"
                className="text-[#8b6f6f] hover:underline font-semibold"
              >
                lecocondelaura17@gmail.com
              </a>
            </p>
            <p className="text-gray-700 leading-relaxed mt-2">
              Vous avez également le droit d'introduire une réclamation auprès
              de la Commission Nationale de l'Informatique et des Libertés
              (CNIL) si vous estimez que vos droits ne sont pas respectés :{" "}
              <a
                href="https://www.cnil.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8b6f6f] hover:underline font-semibold"
              >
                www.cnil.fr
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#8b6f6f] mb-4">
              8. Sécurité des données
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Nous mettons en œuvre toutes les mesures techniques et
              organisationnelles appropriées pour protéger vos données
              personnelles contre la perte, l'utilisation abusive, l'accès non
              autorisé, la divulgation, l'altération ou la destruction.
              Cependant, aucune méthode de transmission sur Internet ou de
              stockage électronique n'est totalement sécurisée. Bien que nous
              nous efforcions d'utiliser des moyens commercialement acceptables
              pour protéger vos données, nous ne pouvons garantir leur sécurité
              absolue.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#8b6f6f] mb-4">
              9. Cookies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Notre site peut utiliser des cookies pour améliorer votre
              expérience de navigation. Les cookies sont de petits fichiers
              texte stockés sur votre appareil lorsque vous visitez un site web.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Vous pouvez configurer votre navigateur pour refuser les cookies,
              mais cela peut affecter certaines fonctionnalités du site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#8b6f6f] mb-4">
              10. Modifications de la politique
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Nous nous réservons le droit de modifier cette politique de
              confidentialité à tout moment. Toute modification sera publiée sur
              cette page avec une indication de la date de mise à jour. Nous
              vous encourageons à consulter régulièrement cette page pour rester
              informé de la manière dont nous protégeons vos données.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#8b6f6f] mb-4">
              11. Contact
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Pour toute question concernant cette politique de confidentialité
              ou le traitement de vos données personnelles, vous pouvez nous
              contacter :
            </p>
            <div className="bg-[#fcebeb] rounded-xl p-4 mt-4">
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
                <strong className="text-[#8b6f6f]">Téléphone :</strong>{" "}
                <a
                  href="tel:0787984341"
                  className="text-[#8b6f6f] hover:underline"
                >
                  07 87 98 43 41
                </a>
              </p>
              <p>
                <strong className="text-[#8b6f6f]">Adresse :</strong> 70 rue
                Sadi Carnot, 17500 Jonzac, France
              </p>
            </div>
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

export default PolitiqueConfidentialite;
