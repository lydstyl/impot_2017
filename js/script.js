$(function(){
    function Personne(options){
        self = this;
        this.objetParent = options.chefFoyer ? 'aucun' : 'vous';
        this.nom = options.nom;
        this.definirConjoint = function(revenuConjoint, nbEnfant){
            if(revenuConjoint){
                return new Personne({
                    revenuImposable : revenuConjoint,
                    nbEnfant : nbEnfant
                });
            }
        };
        this.conjoint = this.definirConjoint(options.revenuConjoint, options.nbEnfant);
        this.statut = this.conjoint || this.objetParent ? 'en couple' : 'célibataire';
        this.nbEnfant = options.nbEnfant;
        this.revenuImposable = options.revenuImposable;
        this.nbPart = 1 + this.nbEnfant * 0.5;;
        this.impotBrut = 0;
        this.calculerImpotBrut = function(revenuImposable, nbPart){
            revenuImposable = Number(revenuImposable);
            //console.log('revenuImposable'+revenuImposable+ ' nbPart'+ nbPart);
            var bareme2017 = [
                {min : 0, max : 9710, taux : 0},
                {min : 9710, max : 26818, taux : 0.14},
                {min : 26818, max : 71898, taux : 0.3},
                {min : 71898, max : 152260, taux : 0.41},
                {min : 152260, max : 999999, taux : 0.45}
            ]
            var etape1 = revenuImposable / nbPart;
            var etape2 = 0;
            for(i in bareme2017){
                if(etape1 > bareme2017[i].min && etape1 > bareme2017[i].max){
                    etape2 += (bareme2017[i].max - bareme2017[i].min) * bareme2017[i].taux;
                }else{
                    etape2 += (etape1 - bareme2017[i].min) * bareme2017[i].taux;
                    break;
                }
            }
            var etape3 = etape2 * nbPart,
            retour = Math.round(etape3);
            self.impotBrut = retour;
            //console.log('retour'+retour);
            return retour;
        };
        this.calculerImpotBrut(this.revenuImposable, this.nbPart);
        this.presenter = function(){
            console.log(
                'nom : ' + this.nom + ' \n' +
                'objet parent : ' + this.objetParent + ' \n' +
                'statut : ' + this.statut + ' \n' +
                'nombre d\'enfant(s) : ' + this.nbEnfant + ' \n' +
                'nombre de part(s) : ' + this.nbPart + ' \n' +
                'revenu imposable : ' + this.revenuImposable + ' \n' +
                'impot brut : ' + this.impotBrut
            );
        };
    };
    /* affichage de l'input revenu conjoint en fonction de la checkbox */
    var enCouple = false, nbEnfant = 0, votreRevenu = 0, reponse;
    if($('[type=checkbox]').is(':checked')){
        $('#revenuConjoint').css('display', 'block');
        enCouple = true;
    }
    $('[type=checkbox]').on('change', function(){
        if($('[type=checkbox]').is(':checked')){
            $('#revenuConjoint').css('display', 'block');
            enCouple = true;
        }else{
            $('#revenuConjoint').css('display', 'none');
            enCouple = false;
        }
    });
    $('[value=Calculer]').on('click', function(){
        nbEnfant = $('[name=enfant]').val();
        votreRevenu = $('[placeholder=votre_revenu]').val();
        if(!enCouple){
            vous = new Personne({
                nom : 'Gabriel',
                chefFoyer : true,
                nbEnfant : nbEnfant,
                revenuImposable : votreRevenu
            });
            reponse = 'Dans ce cas, votre impot brut sera ' + vous.impotBrut + ' €'
        }else{ // en couple
            var revenuConjoint = $('[placeholder=revenu_conjoint]').val(),
            nbDePart, nbDePartConjoint;
            vous = new Personne({
                nom : 'Gabriel',
                chefFoyer : true,
                revenuConjoint : revenuConjoint,
                nbEnfant : nbEnfant,
                revenuImposable : votreRevenu
            });
            nbEnfant = Number(nbEnfant);
            var il = nbEnfant + 1 , meilleureSolution = {numero : 1, impotBrutTotal : 0}, total;
            vous.conjoint.nom = 'Amélie';
            if(nbEnfant > 0)reponse = 'Si vous n\'êtes pas soumis à une déclaration commune,  plusieurs possibilités s\'offrent à vous :<br /><br /><br />';
            for(var i = 0; i < il; i++){
                nbDePart = 1 + (nbEnfant * 0.5) - (i * 0.5);
                vous.nbPart = nbDePart;
                vous.impotBrut = vous.calculerImpotBrut(vous.revenuImposable, vous.nbPart);                
                nbDePartConjoint = 1 + (i * 0.5);
                vous.conjoint.nbPart = nbDePartConjoint;
                vous.conjoint.impotBrut = vous.conjoint.calculerImpotBrut(vous.conjoint.revenuImposable, vous.conjoint.nbPart);
                reponse += 'Solution ' + (i + 1) + ' :<br />';
                reponse += 'Vous : ' + vous.nbPart + ' part(s), ' + vous.impotBrut + ' € d\'impot brut <br />';
                reponse += '+ votre conjoint(e) : ' + vous.conjoint.nbPart+ ' part(s), ' + vous.conjoint.impotBrut + ' € d\'impot brut <br />';
                total = Number(vous.impotBrut) + Number(vous.conjoint.impotBrut);
                if(!i)meilleureSolution.impotBrutTotal = total;
                if(total < meilleureSolution.impotBrutTotal){
                    meilleureSolution.impotBrutTotal = total;
                    meilleureSolution.numero = i + 1;
                }
                reponse += 'Total = ' + total + ' € d\'impot brut<br /><br /><br />';
                //console.log('i + 1 ' + (i + 1) + ' meilleurSolution : ' + meilleureSolution.numero + ' ' + meilleureSolution.impotBrutTotal)
            }
            reponse += '<strong>La meilleure solution est la numéro ' + meilleureSolution.numero + ' qui donne un impot brut total de ' + meilleureSolution.impotBrutTotal + ' €. Attention, on parle d\'impot brut ...</strong>';
        }
        $('p').html(reponse);
    });
});