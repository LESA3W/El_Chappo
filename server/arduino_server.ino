#include <SoftwareSerial.h>
SoftwareSerial bt(2, 3); // RX, TX pour HC-05

void setup() {
  Serial.begin(9600);    // liaison avec le PC
  bt.begin(9600);        // liaison avec le HC-05
}

void loop() {
  if (Serial.available()) {
    char c = Serial.read();
    bt.write(c); // transmet au HC-05
  }
}
