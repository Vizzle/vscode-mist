import { SignatureHelpProvider, TextDocument, Position, CancellationToken, SignatureHelp, SignatureInformation, ParameterInformation } from "vscode";
import { MistDocument } from "./mistDocument";


export class MistSignatureHelpProvider implements SignatureHelpProvider {
    
    provideSignatureHelp(document: TextDocument, position: Position, token: CancellationToken): SignatureHelp | Thenable<SignatureHelp> {
        return MistDocument.getDocumentByUri(document.uri).provideSignatureHelp(position, token);
    }
    
}