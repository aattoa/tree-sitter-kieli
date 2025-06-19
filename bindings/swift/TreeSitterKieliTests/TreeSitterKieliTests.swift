import XCTest
import SwiftTreeSitter
import TreeSitterKieli

final class TreeSitterKieliTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_kieli())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Kieli grammar")
    }
}
