/**
 * Demo-Daten für die Schwer-Editor-Seiten, 1:1 aus den Storybook-Stories
 * (`stories/components/*.stories.tsx`) übernommen, damit Doku und Storybook
 * dieselben Beispiele zeigen.
 */

/** MaKo-Demoprozess (BpmnViewer.stories.tsx): Eingang prüfen → anreichern → senden. */
export const BPMN_VIEWER_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  id="Defs_Mako" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_UTILMD" isExecutable="false">
    <bpmn:startEvent id="Start" name="UTILMD eingegangen">
      <bpmn:outgoing>f1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:userTask id="Pruefen" name="Eingang prüfen">
      <bpmn:incoming>f1</bpmn:incoming>
      <bpmn:outgoing>f2</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="GW" name="Plausibel?">
      <bpmn:incoming>f2</bpmn:incoming>
      <bpmn:outgoing>f3</bpmn:outgoing>
      <bpmn:outgoing>f4</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:serviceTask id="Anreichern" name="Daten anreichern">
      <bpmn:incoming>f3</bpmn:incoming>
      <bpmn:outgoing>f5</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:sendTask id="Senden" name="APERAK senden">
      <bpmn:incoming>f5</bpmn:incoming>
      <bpmn:outgoing>f6</bpmn:outgoing>
    </bpmn:sendTask>
    <bpmn:endEvent id="Abgelehnt" name="Abgelehnt">
      <bpmn:incoming>f4</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:endEvent id="Fertig" name="Verarbeitet">
      <bpmn:incoming>f6</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="f1" sourceRef="Start" targetRef="Pruefen" />
    <bpmn:sequenceFlow id="f2" sourceRef="Pruefen" targetRef="GW" />
    <bpmn:sequenceFlow id="f3" sourceRef="GW" targetRef="Anreichern" />
    <bpmn:sequenceFlow id="f4" sourceRef="GW" targetRef="Abgelehnt" />
    <bpmn:sequenceFlow id="f5" sourceRef="Anreichern" targetRef="Senden" />
    <bpmn:sequenceFlow id="f6" sourceRef="Senden" targetRef="Fertig" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="Diag">
    <bpmndi:BPMNPlane id="Plane" bpmnElement="Process_UTILMD">
      <bpmndi:BPMNShape id="Start_di" bpmnElement="Start"><dc:Bounds x="160" y="180" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Pruefen_di" bpmnElement="Pruefen"><dc:Bounds x="250" y="158" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_di" bpmnElement="GW" isMarkerVisible="true"><dc:Bounds x="405" y="173" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Anreichern_di" bpmnElement="Anreichern"><dc:Bounds x="510" y="158" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Senden_di" bpmnElement="Senden"><dc:Bounds x="670" y="158" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Abgelehnt_di" bpmnElement="Abgelehnt"><dc:Bounds x="412" y="300" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Fertig_di" bpmnElement="Fertig"><dc:Bounds x="830" y="180" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="f1_di" bpmnElement="f1"><di:waypoint x="196" y="198" /><di:waypoint x="250" y="198" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="f2_di" bpmnElement="f2"><di:waypoint x="350" y="198" /><di:waypoint x="405" y="198" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="f3_di" bpmnElement="f3"><di:waypoint x="455" y="198" /><di:waypoint x="510" y="198" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="f4_di" bpmnElement="f4"><di:waypoint x="430" y="223" /><di:waypoint x="430" y="300" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="f5_di" bpmnElement="f5"><di:waypoint x="610" y="198" /><di:waypoint x="670" y="198" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="f6_di" bpmnElement="f6"><di:waypoint x="770" y="198" /><di:waypoint x="830" y="198" /></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

/** Editor-Demo (BpmnEditor.stories.tsx): kleiner ausführbarer Prozess mit camunda-Extension. */
export const BPMN_EDITOR_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
  id="Defs_Editor" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="Start" name="Antrag eingegangen">
      <bpmn:outgoing>f1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:userTask id="Pruefen" name="Antrag prüfen" camunda:assignee="sachbearbeiter">
      <bpmn:incoming>f1</bpmn:incoming>
      <bpmn:outgoing>f2</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:endEvent id="Ende" name="Abgeschlossen">
      <bpmn:incoming>f2</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="f1" sourceRef="Start" targetRef="Pruefen" />
    <bpmn:sequenceFlow id="f2" sourceRef="Pruefen" targetRef="Ende" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="Diag">
    <bpmndi:BPMNPlane id="Plane" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="Start_di" bpmnElement="Start"><dc:Bounds x="160" y="180" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Pruefen_di" bpmnElement="Pruefen"><dc:Bounds x="250" y="158" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Ende_di" bpmnElement="Ende"><dc:Bounds x="412" y="180" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="f1_di" bpmnElement="f1"><di:waypoint x="196" y="198" /><di:waypoint x="250" y="198" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="f2_di" bpmnElement="f2"><di:waypoint x="350" y="198" /><di:waypoint x="412" y="198" /></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

/** Experten-Demo (DmnExpertEditor.stories.tsx): Rabattstufe als Entscheidungstabelle. */
export const DMN_EXPERT_XML = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"
             xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/"
             xmlns:dc="http://www.omg.org/spec/DMN/20180521/DC/"
             id="def_Expert" name="Experten-Demo"
             namespace="http://camunda.org/schema/1.0/dmn">
  <decision id="Decision_1" name="Rabattstufe">
    <decisionTable id="DT_1" hitPolicy="UNIQUE">
      <input id="in_umsatz" label="Jahresumsatz">
        <inputExpression id="ie_umsatz" typeRef="number"><text>umsatz</text></inputExpression>
      </input>
      <output id="out_rabatt" label="Rabatt" name="rabatt" typeRef="number"/>
      <rule id="r1">
        <inputEntry id="r1i"><text>&lt; 1000</text></inputEntry>
        <outputEntry id="r1o"><text>0</text></outputEntry>
      </rule>
      <rule id="r2">
        <inputEntry id="r2i"><text>[1000..5000]</text></inputEntry>
        <outputEntry id="r2o"><text>5</text></outputEntry>
      </rule>
      <rule id="r3">
        <inputEntry id="r3i"><text>&gt; 5000</text></inputEntry>
        <outputEntry id="r3o"><text>10</text></outputEntry>
      </rule>
    </decisionTable>
  </decision>
  <dmndi:DMNDI>
    <dmndi:DMNDiagram>
      <dmndi:DMNShape dmnElementRef="Decision_1">
        <dc:Bounds height="80" width="180" x="160" y="100" />
      </dmndi:DMNShape>
    </dmndi:DMNDiagram>
  </dmndi:DMNDI>
</definitions>`;

/** Tabellen-Demo (DmnTableEditor.stories.tsx): Marktrolle ermitteln (MaKo-Flavor). */
export const DMN_TABLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"
             id="def_AdressErmittlung" name="Adress-Ermittlung"
             namespace="http://camunda.org/schema/1.0/dmn">
  <decision id="Decision_Marktrolle" name="Marktrolle ermitteln">
    <decisionTable id="DT_Marktrolle" hitPolicy="UNIQUE">
      <input id="in_pruefi" label="Prüfidentifikator">
        <inputExpression id="ie_pruefi" typeRef="string"><text>pruefidentifikator</text></inputExpression>
        <inputValues id="iv_pruefi"><text>"11001","11002","11003"</text></inputValues>
      </input>
      <input id="in_sparte" label="Sparte">
        <inputExpression id="ie_sparte" typeRef="string"><text>sparte</text></inputExpression>
        <inputValues id="iv_sparte"><text>"Strom","Gas"</text></inputValues>
      </input>
      <output id="out_rolle" label="Marktrolle" name="marktrolle" typeRef="string"/>
      <rule id="rule_1">
        <inputEntry id="r1_pruefi"><text>"11001"</text></inputEntry>
        <inputEntry id="r1_sparte"><text>"Strom"</text></inputEntry>
        <outputEntry id="r1_rolle"><text>"LF"</text></outputEntry>
        <annotationEntry><text>Lieferantenwechsel Strom</text></annotationEntry>
      </rule>
      <rule id="rule_2">
        <inputEntry id="r2_pruefi"><text>"11002"</text></inputEntry>
        <inputEntry id="r2_sparte"><text>"Gas"</text></inputEntry>
        <outputEntry id="r2_rolle"><text>"NB"</text></outputEntry>
      </rule>
      <rule id="rule_3">
        <inputEntry id="r3_pruefi"><text>"11003"</text></inputEntry>
        <inputEntry id="r3_sparte"><text>-</text></inputEntry>
        <outputEntry id="r3_rolle"><text>"MSB"</text></outputEntry>
        <annotationEntry><text>Messstellenbetrieb, spartenübergreifend</text></annotationEntry>
      </rule>
    </decisionTable>
  </decision>
</definitions>`;
